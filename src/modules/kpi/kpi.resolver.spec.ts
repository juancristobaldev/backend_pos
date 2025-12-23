import { Test, TestingModule } from '@nestjs/testing';
import { KpiResolver } from './kpi.resolver';

describe('KpiResolver', () => {
  let resolver: KpiResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpiResolver],
    }).compile();

    resolver = module.get<KpiResolver>(KpiResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
