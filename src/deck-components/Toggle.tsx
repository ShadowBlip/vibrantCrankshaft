import { Component, ComponentChildren, createRef } from "preact";
import { GAMEPAD_FOCUSED, onGamepadFocus } from "./Gamepad";

const FIELD_CLASSES =
  "gamepaddialog_Field_S-_La gamepaddialog_WithFirstRow_qFXi6 gamepaddialog_VerticalAlignCenter_3XNvA gamepaddialog_WithDescription_3bMIS gamepaddialog_WithBottomSeparatorStandard_3s1Rk gamepaddialog_ExtraPaddingOnChildrenBelow_5UO-_ gamepaddialog_StandardPadding_XRBFu gamepaddialog_HighlightOnFocus_wE4V6 Panel Focusable";
const TOGGLED_OFF = "gamepaddialog_Toggle_24G4g Focusable";
const TOGGLED_ON = `${TOGGLED_OFF} gamepaddialog_On_3ld7T`;

export interface ToggleProps {
  children?: ComponentChildren;
  description?: string;
  disabled?: boolean;
  name?: string;
  label?: string;
  checked?: boolean;
  onClick?: (e: Event, toggleState: boolean) => Promise<void>;
  onChange?: (toggleState: boolean) => void;
  gamepadGroup?: string;
  gamepadItem?: string;
  gamepadFocused?: string;
}

export interface ToggleState {
  toggled: boolean;
  focused: boolean;
}

export class ToggleField extends Component<ToggleProps, ToggleState> {
  ref = createRef<HTMLDivElement>();

  async componentDidMount() {
    if (!this.ref.current) {
      return;
    }

    // Watch for gamepad focus events
    onGamepadFocus(this.ref.current, (isFocused) => {
      this.setState({ focused: isFocused });
    });
  }

  componentDidUpdate(prevProps: ToggleProps, prevState: ToggleState): void {
    if (
      this.props.checked !== undefined &&
      this.state.toggled !== this.props.checked
    ) {
      this.setState({ toggled: this.props.checked });
    }
  }

  private toggle() {
    const toggled = !this.state.toggled;
    this.setState({
      toggled: toggled,
    });
    if (!this.props.onChange) {
      return;
    }
    this.props.onChange(toggled);
  }

  private async onChange(_e: Event) {
    this.toggle();
  }

  render(props: ToggleProps, state: ToggleState) {
    const buttonClasses = state.toggled ? TOGGLED_ON : TOGGLED_OFF;
    const fieldClasses = state.focused
      ? `${FIELD_CLASSES} ${GAMEPAD_FOCUSED}`
      : FIELD_CLASSES;
    const onClick = props.disabled ? () => {} : (e: Event) => this.onChange(e);

    return (
      <div class={fieldClasses}>
        <div class="gamepaddialog_FieldLabelRow_H9WOq">
          <div class="gamepaddialog_FieldLabel_3b0U-">{props.label}</div>
          <div
            ref={this.ref}
            class={buttonClasses}
            onClick={onClick}
            data-cs-gp-in-group={props.gamepadGroup}
            data-cs-gp-item={props.gamepadItem}
            data-cs-gp-init-focus={props.gamepadFocused}
          >
            <div class="gamepaddialog_ToggleRail_2JtC3"></div>
            <div class="gamepaddialog_ToggleSwitch_3__OD"></div>
          </div>
        </div>
        <div class="gamepaddialog_FieldDescription_2OJfk">
          {props.description}
        </div>
      </div>
    );
  }
}
