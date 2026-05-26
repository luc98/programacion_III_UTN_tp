import { Component, OnInit } from '@angular/core';
import { TeamStateViewModel } from './model/team-state-view-model.interface';
import { TeamStateService } from './service/team-state.service';

@Component({
  selector: 'app-team-state-page',
  standalone: false,
  templateUrl: './team-state.component.html',
  styleUrls: ['./team-state.component.css'],
})
export class TeamStatePageComponent implements OnInit {
  constructor(private readonly teamStateService: TeamStateService) {}

  get pageState(): TeamStateViewModel {
    return this.teamStateService.getViewModel();
  }

  ngOnInit(): void {
    this.teamStateService.initialize();
  }

  onRefresh(): void {
    this.teamStateService.refresh();
  }

  getTacticalBarWidth(value: number): string {
    return `${Math.max(0, Math.min(99, value))}%`;
  }

  getEnergyClass(energyLabel: string): string {
    switch ((energyLabel ?? '').toLowerCase()) {
      case 'alto':
        return 'energy-high';
      case 'medio':
        return 'energy-medium';
      case 'bajo':
        return 'energy-low';
      default:
        return '';
    }
  }
}
