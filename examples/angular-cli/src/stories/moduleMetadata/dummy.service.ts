import { Injectable } from '@angular/core';

@Injectable()
export class DummyService {
  // eslint-disable-next-line no-empty-function, @typescript-eslint/no-useless-constructor
  constructor() {}

  getItems() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(['Joe', 'Jane']);
      }, 2000);
    });
  }
}
