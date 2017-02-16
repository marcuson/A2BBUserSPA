/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { A2bbAuthService } from './a2bb-auth.service';

describe('A2bbAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [A2bbAuthService]
    });
  });

  it('should ...', inject([A2bbAuthService], (service: A2bbAuthService) => {
    expect(service).toBeTruthy();
  }));
});
