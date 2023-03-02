import { Test, TestingModule } from '@nestjs/testing';
import { OnlineTableGateway } from './online-table.gateway';
import { OnlineTableService } from './online-table.service';

describe('OnlineTableGateway', () => {
  let gateway: OnlineTableGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineTableGateway, OnlineTableService],
    }).compile();

    gateway = module.get<OnlineTableGateway>(OnlineTableGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
