webpackJsonp([24],{608:function(e,n,t){"use strict";function r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function o(e,n){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!n||"object"!=typeof n&&"function"!=typeof n?e:n}function u(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function, not "+typeof n);e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),n&&(Object.setPrototypeOf?Object.setPrototypeOf(e,n):e.__proto__=n)}function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}Object.defineProperty(n,"__esModule",{value:!0}),t.d(n,"LoginGate",function(){return g}),t.d(n,"default",function(){return d});var c=t(6),a=t.n(c),l=t(54),f=(t.n(l),t(11)),s=t.n(f),p=function(){function e(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}}(),b=Object(l.kea)({actions:function(){return{setUser:function(e){return{user:e}}}},reducers:function(e){var n=e.actions;return{user:[null,s.a.object,i({},n.setUser,function(e,n){return n.user})],isLoggedIn:[!1,s.a.bool,i({},n.setUser,function(){return!0})]}}}),g=Object(l.kea)({selectors:function(){return{isLoginPath:[function(){return[function(){return"/login"===window.location.pathname}]},function(e){return e},s.a.bool]}},connect:{props:[b,["isLoggedIn"]]}})(function(e){var n=e.isLoginPath,t=e.isLoggedIn,r=e.children;return a.a.createElement("div",null,t?r:n?"login page":"no login")}),d=function(e){function n(){return r(this,n),o(this,(n.__proto__||Object.getPrototypeOf(n)).apply(this,arguments))}return u(n,e),p(n,[{key:"render",value:function(){return a.a.createElement("div",{style:{textAlign:"center"}},a.a.createElement(g,null,"logged in"))}}]),n}(c.Component)}});