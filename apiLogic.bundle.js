webpackJsonp([9],{596:function(e,n,t){"use strict";function a(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function c(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}Object.defineProperty(n,"__esModule",{value:!0}),t.d(n,"default",function(){return p});var s=t(6),r=t.n(s),i=t(243),l=function(){function e(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(n,t,a){return t&&e(n.prototype,t),a&&e(n,a),n}}(),u={keaUsage:t(816),keaPath:t(817),keaConstants:t(818),keaActions:t(819),keaReducers:t(820),keaSelectors:t(821),keaConnect:t(822)},p=function(e){function n(){return a(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return c(n,e),l(n,[{key:"render",value:function(){return r.a.createElement("div",{className:"api-scene"},r.a.createElement("h2",null,r.a.createElement("code",null,"kea(options)")),r.a.createElement("p",null,"Create a new kea ",r.a.createElement("strong",null,"logic store")," and connect it to redux."),r.a.createElement("h3",null,"Usage"),r.a.createElement("p",null,"Here is a complete example with all the options available. See below for further explanations."),r.a.createElement(i.default,{className:"javascript"},u.keaUsage),r.a.createElement("h3",null,"Options"),r.a.createElement("h4",null,"path: ",r.a.createElement("code",null,"() => []")),r.a.createElement("p",null,"Give a name to the logic store and register it in a certain location in your application's Redux tree."),r.a.createElement(i.default,{className:"javascript"},u.keaPath),r.a.createElement("h4",null,"constants: ",r.a.createElement("code",null,"() => []")),r.a.createElement("p",null,"Create constants that can be used in other parts of the logic store."),r.a.createElement(i.default,{className:"javascript"},u.keaConstants),r.a.createElement("h4",null,"actions: ",r.a.createElement("code",null,"({ path, constants }) => ({})")),r.a.createElement("p",null,"Define action creators"),r.a.createElement(i.default,{className:"javascript"},u.keaActions),r.a.createElement("h4",null,"reducers: ",r.a.createElement("code",null,"({ path, constants, actions }) => ({})")),r.a.createElement("p",null,"Define the structure and logic of your reducers"),r.a.createElement(i.default,{className:"javascript"},u.keaReducers),r.a.createElement("h4",null,"selectors: ",r.a.createElement("code",null,"({ path, constants, actions, selectors }) => ({})")),r.a.createElement("p",null,"Define selectors, which are only recomputed when their input changes"),r.a.createElement(i.default,{className:"javascript"},u.keaSelectors),r.a.createElement("h4",null,"connect: ",r.a.createElement("code",null,"{}")),r.a.createElement("p",null,"Fetch actions and selectors/props from other logic stores."),r.a.createElement(i.default,{className:"javascript"},u.keaConnect))}}]),n}(s.Component)},816:function(e,n){e.exports="// scenes/my-random-scene/logic.js\nimport { kea } from 'kea'\n\nimport otherLogic from './other-logic.js'\n\nexport default kea({\n  connect: {\n    actions: [\n      otherLogic, [\n        'firstAction',\n        'secondAction as renamedAction'\n      ]\n    ],\n\n    props: [\n      otherLogic, [\n        'firstProp',\n        'secondProp as renamedProp',\n        '* as allProps'\n      ],\n      // select from any redux tree node\n      (state) => state.somethingThatResolvesToAnObject, [\n        'variable',\n        'otherVariable'\n      ]\n    ]\n  },\n\n  path: () => ['scenes', 'myRandomScene', 'index'],\n\n  constants: () => ['STRING', 'OTHER_STRING'],\n\n  actions: ({ path, constants }) => ({\n    actionWithStaticPayload: 'payload value',\n    anotherActionWithAStaticPayload: { thisIs: 'that' },\n    simpleAction: true,\n\n    actionWithDynamicPayload: (id) => ({ id }),\n    actionWithManyParameters: (id, message) => ({ id, message }),\n    actionWithObjectInput: ({ id, message }) => ({ id, message })\n  }),\n\n  reducers: ({ actions, path, constants }) => ({\n    reducerKey: [defaultValue, propType, /* optional options: { persist: true }, */ {\n      // operations\n      [actions.simpleAction]: (state, payload) => state + payload.value // return the new state,\n      [actions.complexAction]: (state, payload) => {\n        // do more things in the block\n        return state + payload.value\n      },\n      [actions.noStateUsed]: (_, payload) => payload.value,\n      [actions.setToTrue]: () => true,\n      [actions.clearSomething]: () => false,\n      \"ANY_OTHER_ACTION_TYPE\": (state, payload, meta) => 'do whatever you want'\n    }],\n\n    constantDefault: [constants.OTHER_STRING, PropTypes.string, {\n      [actions.clearSomething]: () => constants.STRING,\n      [actions.someOtherAction]: (_, payload) => payload.value\n    }]\n  }),\n\n  selectors: ({ path, constants, actions, selectors }) => ({\n    selectorName: [\n      () => [selectors.inputSelector1, selectors.inputSelector2],\n      (input1, input2) => createOutput(input),\n      returnPropType\n    ],\n\n    computedValue: [\n      () => [selectors.reducerKey, selectors.constantDefault],\n      (reducerKey, constantDefault) => {\n        return complicatedOperation(reducerKey, constantDefault)\n      },\n      PropTypes.object\n    ]\n  }),\n\n  // saga functions\n\n  start: function * () {\n    // saga started or component mounted\n    console.log(this)\n  },\n\n  stop: function * () {\n    // saga cancelled or component unmounted\n  },\n\n  takeEvery: ({ actions, workers }) => ({\n    [actions.simpleAction]: function * () {\n      // inline worker\n    },\n    [actions.actionWithDynamicPayload]: workers.dynamicWorker\n  }),\n\n  takeLatest: ({ actions, workers }) => ({\n    [actions.actionWithStaticPayload]: function * () {\n      // inline worker\n    },\n    [actions.actionWithManyParameters]: workers.dynamicWorker\n  }),\n\n  workers: {\n    * dynamicWorker (action) {\n      const { id, message } = action.payload // if from takeEvery/takeLatest\n      // reference with workers.dynamicWorker\n    },\n    longerWayToDefine: function * () {\n      // another way to define a worker\n    }\n  },\n\n  sagas: [saga1, saga2]\n})\n\n// index.js\nimport myRandomSceneLogic from 'scenes/my-random-scene/logic'\n"},817:function(e,n){e.exports="// Input\npath: () => ['scenes', 'myRandomScene', 'logicMountPoint']\n\n// Output\nmyRandomSceneLogic.path == ['scenes', 'myRandomScene', 'logicMountPoint']\n"},818:function(e,n){e.exports="// Input\nconstants: () => ['STRING', 'OTHER_STRING']\n\n// Output\nmyRandomSceneLogic.constants == { STRING: 'STRING', OTHER_STRING: 'OTHER_STRING' }\n"},819:function(e,n){e.exports="// Input\nactions: ({ path, constants }) => ({\n  actionWithStaticPayload: 'payload value',\n  anotherActionWithAStaticPayload: { thisIs: 'that' },\n  simpleAction: true,\n\n  actionWithDynamicPayload: (id) => ({ id }),\n  actionWithManyParameters: (id, message) => ({ id, message }),\n  actionWithObjectInput: ({ id, message }) => ({ id, message })\n})\n\n// Output\nmyRandomSceneLogic.actions == {\n  actionWithStaticPayload: () => ({ type: '...', payload: { value: 'payload value' } }),\n  anotherActionWithAStaticPayload: () => ({ type: '...', payload: { thisIs: 'that' } }),\n  simpleAction: () => ({ type: '...', payload: { value: true } }),\n\n  actionWithDynamicPayload: (id) => ({ type: '...', payload: { id } }),\n  actionWithManyParameters: (id, message) => ({ type: '...', payload: { id, message } }),\n  actionWithObjectInput: ({ id, message }) => ({ type: '...', payload: { id, message } })\n}\n"},820:function(e,n){e.exports="// Input\nreducers: ({ actions, path, constants }) => ({\n  reducerKey: [defaultValue, propType, /* optional options: { persist: true }, */ {\n    // operations\n    [actions.simpleAction]: (state, payload) => state + payload // return the new state,\n    [actions.complexAction]: (state, payload) => {\n      // do more things in the block\n      return state + payload\n    },\n    [actions.noStateUsed]: (_, payload) => payload.value,\n    [actions.setToTrue]: () => true,\n    [actions.clearSomething]: () => false,\n    \"ANY_OTHER_ACTION_TYPE\": (state, payload, meta) => 'do whatever you want'\n  }],\n\n  constantDefault: [constants.OTHER_STRING, PropTypes.string, {\n    [actions.clearSomething]: () => constants.STRING,\n    [actions.someOtherAction]: (_, payload) => payload.value\n  }]\n})\n\n// Output\nmyRandomSceneLogic.reducers == {\n  reducerKey: (initialState = defaultValue, action) => /* ... */,\n  constantDefault: (initialState = constants.OTHER_STRING, action) => /* ... */,\n}\nmyRandomSceneLogic.reducer == combineReducers(reducers)\n"},821:function(e,n){e.exports="// Input\nselectors: ({ path, constants, actions, selectors }) => ({\n  selectorName: [\n    () => [selectors.inputSelector1, selectors.inputSelector2],\n    (input1, input2) => createOutput(input),\n    returnPropType\n  ],\n\n  computedValue: [\n    () => [selectors.reducerKey, selectors.constantDefault],\n    (reducerKey, constantDefault) => {\n      return complicatedOperation(reducerKey, constantDefault)\n    },\n    PropTypes.object\n  ]\n})\n\n// Output\nmyRandomSceneLogic.selectors == {\n  // all reducer keys first,\n  reducerKey: (state) => state.scenes.myRandomScene.index.reducerKey,\n  constantDefault: (state) => state.scenes.myRandomScene.index.constantDefault,\n\n  // other defined selectors\n  selectorName: (state) => memoizedSelectorForSelectorName(state),\n  computedValue: (state) => memoizedSelectorForComputedValue(state)\n}\n\nmyRandomSceneLogic.selector == (state) => ({\n  reducerKey: state.scenes.myRandomScene.index.reducerKey,\n  constantDefault: state.scenes.myRandomScene.index.constantDefault,\n  selectorName: memoizedSelectorForSelectorName(state),\n  computedValue: memoizedSelectorForComputedValue(state)\n})\n"},822:function(e,n){e.exports="// Input\nconnect: {\n  actions: [\n    otherLogic, [\n      'firstAction',\n      'secondAction as renamedAction'\n    ]\n  ],\n\n  props: [\n    otherLogic, [\n      'firstProp',\n      'secondProp as renamedProp',\n      '* as allProps'\n    ],\n    // select from any redux tree node\n    (state) => state.somethingThatResolvesToAnObject, [\n      'variable',\n      'otherVariable'\n    ]\n  ]\n}\n\n// Output\nmyRandomSceneLogic.actions == {\n  firstAction: otherLogic.actions.firstAction,\n  renamedAction: otherLogic.actions.secondAction\n}\n\nmyRandomSceneLogic.selectors == {\n  firstProp: otherLogic.selectors.firstProp,\n  renamedProp: otherLogic.selectors.secondProp,\n  allProps: otherLogic.selector,\n  variable: state.somethingThatResolvesToAnObject.variable,\n  otherVariable: state.somethingThatResolvesToAnObject.otherVariable\n}\n"}});