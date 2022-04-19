const NAMESPACE = "loading"; 
const SHOW = "loading/SHOW"; 
const HIDE = "loading/HIDE";

const LoadingPlugin = ({
    namespace = NAMESPACE,
    includes = [],
    excludes = []
  } = {}) => {
    return store => {
      if (store.state[namespace]) {
        throw new Error(
          `LoadingPlugin: ${namespace} exited in current store`
        );
      }
  
      // new vuex的时候注册一个模块进去
      store.registerModule(namespace, {
        namespaced: true,
        state: {
          global: false, // 定义全局loading
          effects: {}
        },
        // 同步方法
        mutations: {
          SHOW(state, { payload }) {
            state.global = true;
            state.effects = {
              ...state.effects,
              [payload]: true // 将当前的action 置为true
            };
          },
          HIDE(state, { payload }) {
            state.global = false;
            state.effects = {
              ...state.effects,
              [payload]: false // 将当前的action 置为false
            };
          }
        }
      });
  
      store.subscribeAction({
        before: action => {
          if (onEffect(action, includes, excludes)) {
            store.commit({ type: SHOW, payload: action.type });
          }
        },
        after: action => {
          if (onEffect(action, includes, excludes)) {
            store.commit({ type: HIDE, payload: action.type });
          }
        }
      });
    };
  };
  
  // 判断是否要执行
  function onEffect({ type }, includes, excludes) {
    if (includes.length === 0 && excludes.length === 0) {
      return true;
    }
  
    if (includes.length > 0) {
      return includes.indexOf(type) > -1;
    }
  
    return excludes.length > 0 && excludes.indexOf(type) === -1;
  }
  
  export default LoadingPlugin;