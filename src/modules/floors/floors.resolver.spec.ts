import { Test, TestingModule } from '@nestjs/testing';
import { FloorsResolver } from './floors.resolver';

describe('FloorsResolver', () => {
  let resolver: FloorsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FloorsResolver],
    }).compile();

    resolver = module.get<FloorsResolver>(FloorsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
