// src/types/lodash-debounce.d.ts
declare module 'lodash.debounce' {
    import { DebounceSettings } from 'lodash';
  
    function debounce<T extends (...args: any) => any>(
      func: T,
      wait?: number,
      options?: DebounceSettings
    ): T & {
      cancel(): void;
      flush(): void;
    };
  
    export default debounce;
  }
  