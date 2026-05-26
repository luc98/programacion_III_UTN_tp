import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../basic/abstract.controller';
import { CurrentWorldCupQueryRequest } from '../../world-cup/controllers/request/current-world-cup-query.request';
import { TeamStateService } from '../services/team-state.service';

@ApiTags('final-match')
@Controller('final-match')
export class TeamStateController extends AbstractController {
  constructor(private readonly teamStateService: TeamStateService) {
    super();
  }

  @Get('squad')
  @ApiOperation({ summary: 'Team State - squad and tactical state for the current final match' })
  @ApiQuery({ name: 'lang', required: false, enum: ['es', 'en'] })
  public async getSquad(@Query() request: CurrentWorldCupQueryRequest): Promise<unknown> {
    return this.createOkResponse(await this.teamStateService.getSquad(request.lang));
  }
}
