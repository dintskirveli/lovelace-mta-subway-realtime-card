import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import './editor';

import { MTASubwayRealtimeCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

/* eslint no-console: 0 */
console.info(
  `%c  MTA-SUBWAY-REALTIME CARD \n%c  Version ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// TODO Name your custom element
@customElement('mta-subway-realtime-card')
export class MTASubwayRealtimeCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('mta-subway-realtime-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: MTASubwayRealtimeCardConfig;

  public setConfig(config: MTASubwayRealtimeCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config || config.show_error) {
      throw new Error('Invalid configuration');
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this._config = {
      name: 'MTASubwayRealtime',
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">Show Warning</div>
        </ha-card>
      `;
    }

    console.log(this.hass.states[this._config.entity]);

    const header_name =
      this.hass.states[this._config.entity].attributes.station_name +
      ' to ' +
      this.hass.states[this._config.entity].attributes.station_direction_label;

    const now = new Date();

    return html`
      <ha-card
        .header=${header_name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config.hold_action),
          hasDoubleTap: hasAction(this._config.double_tap_action),
          repeat: this._config.hold_action ? this._config.hold_action.repeat : undefined,
        })}
        tabindex="0"
        aria-label=${`MTASubwayRealtime: ${this.hass.states[this._config.entity].attributes.friendly_name}`}
      >
        <div style="width: 100%;">
          <div style="text-align: center;">
            <b>Data updated: </b>${new Date(
              this.hass.states[this._config.entity].attributes.arrivals[0].last_updated * 1000,
            ).toLocaleTimeString()} <b>Card updated: </b>${now.toLocaleTimeString()}
          </div>
          <div style="display: table; padding: 20px;">
            ${this.hass.states[this._config.entity].attributes.arrivals.slice(0, 4).map(arrival => {
              return html`
                <div style="display: table-row">
                  <div style="display: table-cell;">
                    <img
                      class="lineLogo"
                      src="/community_plugin/lovelace-mta-subway-realtime/public/${arrival.line.toLowerCase()}.svg"
                    />
                  </div>
                  <div style="display: table-cell; vertical-align: middle; padding-left: 20px;">
                    <b style="font-size: 30px;">${Math.ceil((arrival.time * 1000 - now.getTime()) / 1000 / 60)} min</b>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this._config && ev.detail.action) {
      handleAction(this, this.hass, this._config, ev.detail.action);
    }
  }

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }
      .lineLogo {
        width: 50px;
        height: auto;
      }
    `;
  }
}
