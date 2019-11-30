import { ActionConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface MTASubwayRealtimeCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_aciton?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
