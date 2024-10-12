import * as logger from '@tauri-apps/plugin-log';

export function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
) {
  const original = console[fnName];
  console[fnName] = (message) => {
    original(message);
    if(fnName==='log'){
      logger.trace(message);
    }else{
      logger[fnName](message);
    }
   
  };
}