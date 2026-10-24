export type TimerMode = 'focus' | 'short' | 'long';
export type TimerState = {
  mode: TimerMode;
  minutes: Record<TimerMode, number>;
  remaining: number;
  endsAt: number | null;
  completed: number;
  finished: boolean;
};
export type TimerAction =
  | {type: 'toggle'; now: number}
  | {type: 'tick'; now: number}
  | {type: 'mode'; mode: TimerMode}
  | {type: 'adjust'; delta: number}
  | {type: 'reset'};
export const initialTimer: TimerState = {
  mode: 'focus',
  minutes: {focus: 25, short: 5, long: 15},
  remaining: 1500,
  endsAt: null,
  completed: 0,
  finished: false,
};
export function timerReducer(
  state: TimerState,
  action: TimerAction,
): TimerState {
  if (
    action.type === 'tick' ||
    (action.type === 'toggle' && state.endsAt !== null)
  ) {
    if (state.endsAt === null) return state;
    const remaining = Math.max(
      0,
      Math.ceil((state.endsAt - action.now) / 1000),
    );
    if (!remaining)
      return {
        ...state,
        remaining: 0,
        endsAt: null,
        finished: true,
        completed: state.completed + (state.mode === 'focus' ? 1 : 0),
      };
    return {
      ...state,
      remaining,
      endsAt: action.type === 'toggle' ? null : state.endsAt,
    };
  }
  if (action.type === 'toggle') {
    const remaining = state.finished
      ? state.minutes[state.mode] * 60
      : state.remaining;
    return {
      ...state,
      remaining,
      endsAt: action.now + remaining * 1000,
      finished: false,
    };
  }
  if (action.type === 'mode')
    return {
      ...state,
      mode: action.mode,
      remaining: state.minutes[action.mode] * 60,
      endsAt: null,
      finished: false,
    };
  if (action.type === 'reset')
    return {
      ...state,
      remaining: state.minutes[state.mode] * 60,
      endsAt: null,
      finished: false,
    };
  if (action.type === 'adjust') {
    if (state.endsAt !== null) return state;
    const value = Math.min(
      90,
      Math.max(1, state.minutes[state.mode] + action.delta),
    );
    return {
      ...state,
      minutes: {...state.minutes, [state.mode]: value},
      remaining: value * 60,
      finished: false,
    };
  }
  return state;
}
export function timerLabel(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}`;
}
