import { Fragment } from "preact";

export interface PanelSectionProps {
  children?: any;
  title?: string;
  spinner?: boolean;
}

export function PanelSection(props: PanelSectionProps) {
  const title = props.title ? (
    PanelSectionRow({ children: props.title })
  ) : (
    <Fragment />
  );
  return (
    <div class="quickaccesscontrols_PanelSection_2C0g0">
      {title}
      {props.children}
    </div>
  );
}

export function PanelSectionRow(props: PanelSectionProps) {
  return (
    <div class="quickaccesscontrols_PanelSectionRow_2VQ88">
      {props.children}
    </div>
  );
}

export function PanelSectionTitle(props: { children?: any }) {
  return (
    <div class="quickaccesscontrols_PanelSectionTitle_2iFf9">
      <div class="quickaccesscontrols_Text_1hJkB">{props.children}</div>
    </div>
  );
}
