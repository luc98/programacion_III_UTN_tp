import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { BaseApiService } from '../../../../core/services/base-api.service';
import { UiVisualsService } from '../../../../core/services/ui-visuals.service';
import { TeamStateApiResponse, TeamStateTeamApiItem } from '../model/team-state-api.interface';
import { TeamStateViewModel } from '../model/team-state-view-model.interface';

@Injectable({ providedIn: 'root' })
export class TeamStateService extends BaseApiService {
  private readonly uiVisualsService = inject(UiVisualsService);

  private readonly pageState: TeamStateViewModel = {
    lang: 'es',
    loading: false,
    errorMessage: '',
    showNoFinalState: false,
    data: null,
  };

  private hasInitialized = false;

  getViewModel(): TeamStateViewModel {
    return this.pageState;
  }

  initialize(): void {
    if (this.hasInitialized) {
      this.loadSquad().subscribe();
      return;
    }

    this.hasInitialized = true;
    this.pageState.lang = this.getCurrentLang();

    combineLatest([
      this.appContextService.currentTeamId$,
      this.appContextService.lang$,
      this.appContextService.finalMatchRefresh$,
    ])
      .pipe(
        tap(([, lang]) => (this.pageState.lang = lang === 'en' ? 'en' : 'es')),
        switchMap(() => this.loadSquad()),
      )
      .subscribe();
  }

  refresh(): void {
    this.loadSquad().subscribe();
  }

  private loadSquad(): Observable<void> {
    const lang = this.getCurrentLang();
    this.pageState.lang = lang;
    this.pageState.loading = true;
    this.pageState.errorMessage = '';
    this.pageState.showNoFinalState = false;

    return this.get<TeamStateApiResponse>('/final-match/squad', { lang }).pipe(
      map((response) => response.data),
      map((data) => this.normalizeTeamState(data)),
      tap((data) => {
        this.pageState.data = data ?? null;
        this.pageState.showNoFinalState = !data;
      }),
      map(() => undefined),
      catchError((error: HttpErrorResponse) => {
        this.pageState.data = null;
        if (this.isTeamStateUnavailableError(error)) {
          this.pageState.showNoFinalState = true;
          this.pageState.errorMessage = '';
        } else {
          this.pageState.errorMessage =
            'No se pudo cargar el estado del equipo. Intenta nuevamente.';
        }
        return of(undefined);
      }),
      finalize(() => (this.pageState.loading = false)),
    );
  }

  private normalizeTeamState(
    data: TeamStateApiResponse | null | undefined,
  ): TeamStateApiResponse | null {
    if (!data) {
      return null;
    }

    return {
      ...data,
      team: this.normalizeTeamItem(data.team),
      opponent: this.normalizeTeamItem(data.opponent),
    };
  }

  private normalizeTeamItem(team: TeamStateTeamApiItem): TeamStateTeamApiItem {
    return {
      ...team,
      flag: this.uiVisualsService.getTeamFlag(team.id),
    };
  }

  private isTeamStateUnavailableError(error: HttpErrorResponse): boolean {
    const messageCode = (
      error?.error as { responseMessage?: { messageCode?: string } } | undefined
    )?.responseMessage?.messageCode;
    return (
      messageCode === 'WC_TEAM_STATE_UNAVAILABLE' || error?.status === 409 || error?.status === 404
    );
  }
}
