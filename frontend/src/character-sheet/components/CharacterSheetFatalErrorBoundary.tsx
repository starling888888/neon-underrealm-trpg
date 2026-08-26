import { Component, type ErrorInfo, type ReactNode } from "react";
import CharacterSheetFatalErrorDialog from "./dialogs/CharacterSheetFatalErrorDialog";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/** Converts uncaught React rendering errors into the common reload recovery UI. */
export default class CharacterSheetFatalErrorBoundary extends Component<
  Props,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {}

  render() {
    return this.state.hasError ? (
      <CharacterSheetFatalErrorDialog />
    ) : (
      this.props.children
    );
  }
}
