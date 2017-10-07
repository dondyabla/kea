import { selectPropsFromLogic } from './connect/props'
import { propTypesFromConnect } from './connect/prop-types'
import { combineReducerObjects, convertReducerArrays } from './logic/reducer'
import { pathSelector, createSelectors } from './logic/selectors'
import { createActions } from './actions/create'
import { selectActionsFromLogic } from './connect/actions'

import convertConstants from '../utils/convert-constants'
import shallowEqual from '../utils/shallow-equal'

import { createSelector } from 'reselect'
import { connectAdvanced } from 'react-redux'

import { setCache, getCache } from './cache'

import { firstReducerRoot, isSyncedWithStore, addReducer } from './reducer'

import { installedPlugins } from './plugins'

const DEBUG = false

function isStateless (Component) {
  return !Component.prototype.render
}

let nonamePathCounter = 0

function createUniquePathFunction () {
  const reducerRoot = firstReducerRoot()
  if (!reducerRoot) {
    console.error('[KEA] Could not find the root of the keaReducer! Make sure you call keaReducer() before any call to kea() is made. See: https://kea.js.org/api/reducer')
  }
  let inlinePath = [reducerRoot, '_kea', `inline-${nonamePathCounter++}`]
  return () => inlinePath
}

const hydrationAction = '@@kea/hydrate store'

export function kea (_input) {
  // clone the input and add a path if needed
  const input = Object.assign(_input.path ? {} : { path: createUniquePathFunction() }, _input)

  const hasConnect = !!(input.connect)
  const hasDefinedPath = !!_input.path
  const hasLogic = !!(input.actions || input.reducers || input.selectors)

  let output = {
    activePlugins: {},
    isSingleton: !input.key,

    path: null,
    constants: {},

    connected: { actions: {}, selectors: {}, propTypes: {} },
    created: { actions: {}, reducerObjects: {}, selectors: {}, propTypes: {}, defaults: {} },

    actions: {},
    reducers: {},
    selector: null,
    selectors: {},
    propTypes: {},
    defaults: {}
  }

  // check which plugins are active based on the input
  installedPlugins.forEach(plugin => {
    output.activePlugins[plugin.name] = plugin.isActive(input, output)
  })

  // set the constants
  output.constants = input.constants ? convertConstants(input.constants(output)) : {}

  // anything to connect to?
  if (hasConnect) {
    // the { connect: { props, actions } } part
    const connect = input.connect || {}

    // store connected actions, selectors and propTypes separately
    output.connected = {
      actions: selectActionsFromLogic(connect.actions),
      selectors: selectPropsFromLogic(connect.props),
      propTypes: propTypesFromConnect(connect)
    }

    // set actions, selectors and propTypes to the connected ones
    Object.assign(output, output.connected)

    // run the afterConnect plugin hook
    installedPlugins.forEach(plugin => {
      plugin.afterConnect && plugin.afterConnect(output.activePlugins[plugin.name], input, output)
    })
  }

  // we don't know yet if it's going to be a singleton (no key) or inline (key)
  // however the actions and constants are common for all, so get a path without the dynamic
  // component and initialize them
  output.path = input.path('').filter(p => p)

  if (input.actions) {
    // create new actions
    output.created.actions = createActions(input.actions(output), output.path)

    // add them to the actions hash
    output.actions = Object.assign(output.actions, output.created.actions)
  }

  // if it's a singleton, create all the reducers and selectors and add them to redux
  if (output.isSingleton) {
    // we have reducer or selector inputs, create all output reducers and selectors
    // ... or the "path" is manually defined, so we must put something in redux
    if (hasDefinedPath || input.reducers || input.selectors) {
      // create the reducers from the input
      output.created.reducerObjects = input.reducers ? convertReducerArrays(input.reducers(output)) : {}

      // add propTypes
      Object.keys(output.created.reducerObjects).forEach(reducerKey => {
        const reducerObject = output.created.reducerObjects[reducerKey]
        if (reducerObject.type) {
          output.created.propTypes[reducerKey] = reducerObject.type
        }

        output.created.defaults[reducerKey] = reducerObject.value
        output.reducers[reducerKey] = reducerObject.reducer
      })

      // combine the created reducers into one
      output.reducer = combineReducerObjects(output.path, output.created.reducerObjects)

      // add a global selector for the path
      output.selector = (state) => pathSelector(output.path, state)

      // create selectors from the reducers
      output.created.selectors = createSelectors(output.path, Object.keys(output.created.reducerObjects))

      // add the created selectors and propTypes to the output
      output.selectors = Object.assign(output.selectors, output.created.selectors)
      output.propTypes = Object.assign(output.propTypes, output.created.propTypes)
      output.defaults = Object.assign(output.defaults, output.created.defaults)

      // any additional selectors to create?
      if (input.selectors) {
        const selectorResponse = input.selectors(output)

        Object.keys(selectorResponse).forEach(selectorKey => {
          // s == [() => args, selectorFunction, propType]
          const s = selectorResponse[selectorKey]
          const args = s[0]()

          if (s[2]) {
            output.created.propTypes[selectorKey] = s[2]
            output.propTypes[selectorKey] = output.created.propTypes[selectorKey]
          }

          output.created.selectors[selectorKey] = createSelector(...args, s[1])
          output.selectors[selectorKey] = output.created.selectors[selectorKey]
        })
      }

      // hook up the reducer to the global kea reducers object
      addReducer(output.path, output.reducer, true)
    }

    installedPlugins.forEach(plugin => {
      plugin.afterCreateSingleton && plugin.afterCreateSingleton(output.activePlugins[plugin.name], input, output)
    })
  }

  // we will return this function which can wrap the logic store around a component
  const response = function (Klass) {
    if (!Klass) {
      console.error('[KEA] Logic stores must be wrapped around React Components or stateless functions!', input, output)
      return
    }

    // inject the propTypes to the class
    Klass.propTypes = Object.assign({}, output.propTypes, Klass.propTypes || {})

    // dealing with a Component
    if (!isStateless(Klass)) {
      // inject to the component something that
      // converts this.props.actions to this.actions
      if (Object.keys(output.actions).length > 0) {
        const originalComponentWillMount = Klass.prototype.componentWillMount
        Klass.prototype.componentWillMount = function () {
          this.actions = this.props.actions
          originalComponentWillMount && originalComponentWillMount.bind(this)()
        }
      }

      // Since Klass == Component, tell the plugins to add themselves to it.
      // if it's a stateless functional component, we'll do it in the end with Redux's Connect class
      installedPlugins.forEach(plugin => {
        plugin.injectToClass && plugin.injectToClass(output.activePlugins[plugin.name], input, output, Klass)
      })
    }

    //
    const selectorFactory = (dispatch, options) => {
      let lastProps = {}
      let result = null

      if (!isSyncedWithStore()) {
        dispatch({ type: hydrationAction })
      }

      return (nextState, nextOwnProps) => {
        let key
        let path
        let joinedPath

        let nextProps = Object.assign({}, nextOwnProps)

        if (hasConnect) {
          // TODO: this will fail if the redux tree is not initialized yet.
          // see comment in logic-component.js

          // connected props
          Object.keys(output.connected.selectors).forEach(propKey => {
            nextProps[propKey] = output.connected.selectors[propKey](nextState, nextOwnProps)
          })
        }

        if (hasLogic) {
          key = input.key ? input.key(nextOwnProps) : null

          if (typeof key === 'undefined') {
            console.error(`"key" can't be undefined in path: ${input.path('undefined').join('.')}`)
          }

          path = input.path(key)
          joinedPath = path.join('.')

          if (DEBUG) {
            console.log(`Inline selectorFactory for ${joinedPath}`)
            console.log({ nextOwnProps, nextState, key, path })
          }

          let selector
          let selectors

          // now we must check if the reducer is already in redux, or we need to add it
          // if we need to add it, create "dummy" selectors for the default values until then

          // is the reducer created? if we have "true" in the cache, it's definitely created
          let reducerCreated = !!getCache(joinedPath, 'reducerCreated')

          // if it's not let's double check. maybe it is now?
          if (!reducerCreated) {
            try {
              selector = (state) => pathSelector(path, state)
              reducerCreated = typeof selector(nextState) !== 'undefined'
            } catch (e) {
              reducerCreated = false
            }
          }

          // we have the selectors cached! with the current reducerCreated state!
          if (!!getCache(joinedPath, reducerCreated) === reducerCreated) {
            if (DEBUG) {
              console.log('cache hit!')
            }
            selector = getCache(joinedPath, 'selector')
            selectors = getCache(joinedPath, 'selectors')

          // either we have nothing cached or the cache is invalid. regenerate the selectors!
          } else {
            if (!selector) {
              selector = (state) => pathSelector(path, state)
            }

            // add { path } and { key } to the reducer creator function
            let localObject = Object.assign({}, output, { path, key, props: nextOwnProps })
            localObject.reducers = input.reducers ? convertReducerArrays(input.reducers(localObject)) : {}
            localObject.reducer = input.reducer ? input.reducer(localObject) : combineReducerObjects(path, localObject.reducers)

            const connectedSelectors = output.connected ? output.connected.selectors : {}

            // if the reducer is in redux, get real reducer selectors. otherwise add dummies that return defaults
            if (reducerCreated) {
              selectors = Object.assign({}, connectedSelectors || {}, createSelectors(path, Object.keys(localObject.reducers)))
            } else {
              addReducer(path, localObject.reducer, true)
              if (!isSyncedWithStore()) {
                dispatch({type: hydrationAction})
              }

              const realSelectors = createSelectors(path, Object.keys(localObject.reducers))

              // if we don't know for sure that the reducer is in the current store output,
              // then fallback to giving the default value
              selectors = Object.assign({}, connectedSelectors || {})
              Object.keys(localObject.reducers).forEach(key => {
                selectors[key] = (state) => {
                  try {
                    return realSelectors[key](state)
                  } catch (error) {
                    return localObject.reducers[key].value
                  }
                }
              })
            }

            // create
            const selectorResponse = input.selectors ? input.selectors(Object.assign({}, localObject, { selectors })) : {}

            Object.keys(selectorResponse).forEach(selectorKey => {
              // s == [() => args, selectorFunction, propType]
              const s = selectorResponse[selectorKey]

              const args = s[0]()
              selectors[selectorKey] = createSelector(...args, s[1])
            })

            // store in the cache
            setCache(joinedPath, {
              reducerCreated,
              selector,
              selectors
            })
          }

          if (DEBUG) {
            console.log({ selector, selectors })
          }

          Object.keys(selectors).forEach(selectorKey => {
            nextProps[selectorKey] = selectors[selectorKey](nextState, nextOwnProps)
          })
        }

        if (DEBUG) {
          console.log({ nextProps })
        }

        // TODO: cache these even if no path present
        let actions = joinedPath ? getCache(joinedPath, 'actions') : null

        if (!actions) {
          actions = {}

          if (hasConnect) {
            // pass conneted actions as they are
            Object.keys(output.connected.actions).forEach(actionKey => {
              actions[actionKey] = (...args) => dispatch(output.connected.actions[actionKey](...args))
            })
          }

          if (hasLogic) {
            // inject key to the payload of inline actions
            Object.keys(output.actions).forEach(actionKey => {
              if (key) {
                actions[actionKey] = (...args) => {
                  const createdAction = output.actions[actionKey](...args)

                  // an object! add the key and dispatch
                  if (typeof createdAction === 'object') {
                    return dispatch(Object.assign({}, createdAction, { payload: Object.assign({ key: key }, createdAction.payload) }))
                  } else { // a function? a string? return it!
                    return dispatch(createdAction)
                  }
                }
              } else {
                actions[actionKey] = (...args) => dispatch(output.actions[actionKey](...args))
              }
            })
          }

          if (DEBUG) {
            console.log({ actions })
          }

          if (joinedPath) {
            setCache(joinedPath, { actions })
          }
        }

        // if the props did not change, return the old cached output
        if (!result || !shallowEqual(lastProps, nextProps)) {
          lastProps = nextProps
          result = Object.assign({}, nextProps, { actions, dispatch })
        }

        return result
      }
    }

    const KonnektedKlass = connectAdvanced(selectorFactory, { methodName: 'kea' })(Klass)

    // If we were wrapping a functional React component, add the plugin code to the connected component.
    if (isStateless(Klass)) {
      installedPlugins.forEach(plugin => {
        plugin.injectToConnectedClass && plugin.injectToConnectedClass(output.activePlugins[plugin.name], input, output, KonnektedKlass)
      })
    }

    return KonnektedKlass
  }

  response.path = output.isSingleton && (hasDefinedPath || hasLogic) ? output.path : undefined

  response.constants = output.constants
  response.actions = output.actions
  response.propTypes = output.propTypes

  if (output.isSingleton) {
    response.reducer = output.reducer
    response.reducers = output.reducers
    response.defaults = output.defaults
    response.selector = output.selector
    response.selectors = output.selectors
  }

  response._isKeaFunction = true
  response._isKeaSingleton = output.isSingleton

  response._hasKeaConnect = hasConnect
  response._hasKeaLogic = hasLogic
  response._keaPlugins = output.activePlugins

  installedPlugins.forEach(plugin => {
    plugin.addToResponse && plugin.addToResponse(output.activePlugins[plugin.name], input, output, response)
  })

  return response
}