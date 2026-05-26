import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { AbstractBaseService } from '../../basic/abstract-base.service';
import { ApiErrorMappingRule, ApiErrorStatusMap, ErrorUtils } from '../../basic/error/error.utils';
import { WorldCupFeatureApiService } from '../../basic/world-cup-feature-api.service';
import { WorldCupCoreErrorCode } from '../../basic/model/world-cup-core-error-code.enum';
import { LanguageEnum } from '../../basic/model/language.enum';
import {
  RawMatchSquadApiResponse,
  RawSquadPlayerItem,
  RawSquadTeamItem,
  TeamStatePlayerItem,
  TeamStateScreenResponse,
  TeamStateTeamItem,
} from './model/team-state-service.interface';

const TEAM_STATE_UNAVAILABLE_MESSAGE =
  'No hay una final activa. Simula el mundial e inicia la final primero.';

const TEAM_STATE_ERROR_STATUS_MAP: ApiErrorStatusMap = {
  [HttpStatus.NOT_FOUND]: {
    messageCode: WorldCupCoreErrorCode.WC_TEAM_STATE_UNAVAILABLE,
    message: TEAM_STATE_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
  [HttpStatus.CONFLICT]: {
    messageCode: WorldCupCoreErrorCode.WC_TEAM_STATE_UNAVAILABLE,
    message: TEAM_STATE_UNAVAILABLE_MESSAGE,
    statusCode: HttpStatus.CONFLICT,
  },
};

const TEAM_STATE_ERROR_FALLBACK: ApiErrorMappingRule = {
  messageCode: WorldCupCoreErrorCode.WC_TEAM_STATE_FETCH_FAILED,
  message: 'No se pudo obtener el estado del plantel. Intenta nuevamente.',
  statusCode: HttpStatus.BAD_GATEWAY,
};

@Injectable()
export class TeamStateService extends AbstractBaseService {
  constructor(
    private readonly worldCupFeatureApiService: WorldCupFeatureApiService,
    adminService: AdminService,
  ) {
    super(adminService);
  }

  public async getSquad(lang?: string): Promise<TeamStateScreenResponse> {
    const resolvedLang = this.resolveLang(lang);

    try {
      const rawSquad: RawMatchSquadApiResponse =
        await this.worldCupFeatureApiService.getCurrentMatchSquad();

      return this.buildTeamStateScreen(rawSquad, resolvedLang);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      ErrorUtils.mapWorldCupApiError(error, TEAM_STATE_ERROR_STATUS_MAP, TEAM_STATE_ERROR_FALLBACK);
    }
  }

  private buildTeamStateScreen(
    raw: RawMatchSquadApiResponse,
    lang: LanguageEnum,
  ): TeamStateScreenResponse {
    return {
      teamId: this.getCurrentTeamId(),
      lang,
      matchId: raw.matchId,
      isActive: raw.isActive,
      isFinished: raw.isFinished,
      minute: raw.minute ?? 0,
      turn: raw.turn ?? 0,
      score: raw.score ?? '0-0',
      team: this.buildTeamItem(raw.team),
      opponent: this.buildTeamItem(raw.opponent),
    };
  }

  private buildTeamItem(rawTeam: RawSquadTeamItem): TeamStateTeamItem {
    const strategy = (rawTeam.strategy ?? '').trim().toUpperCase();
    const onField = (rawTeam.onField ?? []).map((p) => this.buildPlayerItem(p, false));
    const bench = (rawTeam.bench ?? []).map((p) => this.buildPlayerItem(p, true));

    return {
      id: rawTeam.id,
      name: rawTeam.name,
      flag: '',
      formation: rawTeam.formation ?? '-',
      strategy,
      strategyLabel: strategy.replace(/_/g, ' '),
      coachName: rawTeam.coachName ?? '-',
      coachProfile: rawTeam.coachProfile ?? '-',
      tactical: {
        attack: rawTeam.tacticalBreakdown?.effectiveTeamLine?.attack ?? 0,
        defense: rawTeam.tacticalBreakdown?.effectiveTeamLine?.defense ?? 0,
        midfield: rawTeam.tacticalBreakdown?.effectiveTeamLine?.midfield ?? 0,
      },
      maxSubstitutions: rawTeam.maxSubstitutions ?? 0,
      substitutionsUsed: rawTeam.substitutionsUsed ?? 0,
      remainingSubstitutions: rawTeam.remainingSubstitutions ?? 0,
      onFieldCount: onField.length,
      onField,
      bench,
    };
  }

  private buildPlayerItem(raw: RawSquadPlayerItem, isBench: boolean): TeamStatePlayerItem {
    return {
      playerId: raw.playerId,
      name: raw.name,
      shirtNumber: raw.shirtNumber,
      position: raw.position,
      age: raw.age,
      energy: raw.energy,
      isCaptain: raw.isCaptain,
      isStarter: raw.isStarter,
      isOnField: raw.isOnField,
      yellowCards: raw.yellowCards,
      redCard: raw.redCard,
      isInjured: raw.isInjured,
      positionTag: raw.position,
      displayName: raw.name,
      energyLabel: this.resolveEnergyLabel(raw.energy),
      isBench,
    };
  }

  private resolveEnergyLabel(energy: number): string {
    if (energy > 70) return 'Alto';
    if (energy >= 40) return 'Medio';
    return 'Bajo';
  }
}
