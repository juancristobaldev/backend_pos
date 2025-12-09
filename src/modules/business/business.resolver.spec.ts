import { Test, TestingModule } from '@nestjs/testing';
import { BusinessResolver } from './business.resolver';

describe('BusinessResolver', () => {
  let resolver: BusinessResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessResolver],
    }).compile();

    resolver = module.get<BusinessResolver>(BusinessResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
