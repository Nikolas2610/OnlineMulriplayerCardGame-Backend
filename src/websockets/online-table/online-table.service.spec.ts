import { Test, TestingModule } from '@nestjs/testing';
import { OnlineTableService } from './online-table.service';

describe('OnlineTableService', () => {
  let service: OnlineTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineTableService],
    }).compile();

    service = module.get<OnlineTableService>(OnlineTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
