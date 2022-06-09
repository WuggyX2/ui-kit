import {SearchEngine} from '../../app/search-engine/search-engine';
import {TriggerSection} from '../../state/state-sections';
import {triggers} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';
import {arrayEqual} from '../../utils/compare-utils';

/**
 * The `NotifyTrigger` controller handles Notify triggers.
 */
export interface NotifyTrigger extends Controller {
  /**
   * the state of the `NotifyTrigger` controller.
   */
  state: NotifyTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NotifyTrigger` controller.
 */
export interface NotifyTriggerState {
  /**
   * The notification to display to the user after receiving a notification trigger.
   *
   * @deprecated Use `notifications` instead.
   */
  notification: string;
  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];
}

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 * */
export function buildNotifyTrigger(engine: SearchEngine): NotifyTrigger {
  if (!loadNotifyTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  let previousNotifications = getState().triggers.notifications;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = !arrayEqual(
          previousNotifications,
          this.state.notifications
        );
        previousNotifications = this.state.notifications;

        if (hasChanged) {
          listener();
          dispatch(logNotifyTrigger());
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        notification: getState().triggers.notification,
        notifications: getState().triggers.notifications,
      };
    },
  };
}

function loadNotifyTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
