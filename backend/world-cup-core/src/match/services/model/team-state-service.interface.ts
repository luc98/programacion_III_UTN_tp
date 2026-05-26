export interface RawSquadPlayerItem {
  playerId: string;
  name: string;
  position: string;
  shirtNumber: number;
  age: number;
  energy: number;
  isCaptain: boolean;
  isStarter: boolean;
  isOnField: boolean;
  yellowCards: number;
  redCard: boolean;
  isInjured: boolean;
}

export interface RawSquadTeamItem {
  id: string;
  name: string;
  formation: string | null;
  strategy: string | null;
  coachName: string | null;
  coachProfile: string | null;
  tacticalBreakdown: {
    effectiveTeamLine: {
      attack: number;
      defense: number;
      midfield: number;
    };
  };
  maxSubstitutions: number;
  substitutionsUsed: number;
  remainingSubstitutions: number;
  onFieldCount: number;
  onField: RawSquadPlayerItem[];
  bench: RawSquadPlayerItem[];
}

export interface RawMatchSquadApiResponse {
  matchId: string;
  isActive: boolean;
  isFinished: boolean;
  minute: number;
  turn: number;
  score: string;
  team: RawSquadTeamItem;
  opponent: RawSquadTeamItem;
}

export interface TeamStatePlayerItem {
  playerId: string;
  name: string;
  shirtNumber: number;
  position: string;
  age: number;
  energy: number;
  isCaptain: boolean;
  isStarter: boolean;
  isOnField: boolean;
  yellowCards: number;
  redCard: boolean;
  isInjured: boolean;
  positionTag: string;
  displayName: string;
  energyLabel: string;
  isBench: boolean;
}

export interface TeamStateTeamItem {
  id: string;
  name: string;
  flag: string;
  formation: string;
  strategy: string;
  strategyLabel: string;
  coachName: string;
  coachProfile: string;
  tactical: {
    attack: number;
    defense: number;
    midfield: number;
  };
  maxSubstitutions: number;
  substitutionsUsed: number;
  remainingSubstitutions: number;
  onFieldCount: number;
  onField: TeamStatePlayerItem[];
  bench: TeamStatePlayerItem[];
}

export interface TeamStateScreenResponse {
  teamId: string;
  lang: string;
  matchId: string;
  isActive: boolean;
  isFinished: boolean;
  minute: number;
  turn: number;
  score: string;
  team: TeamStateTeamItem;
  opponent: TeamStateTeamItem;
}
