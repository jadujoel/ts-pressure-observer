
/**
 * - ⚪ `"nominal"`: The conditions of the target device are at an acceptable level with no noticeable adverse effects on the user.
 * - 🟢 `"fair"`: Target device pressure, temperature and/or energy usage are slightly elevated, potentially resulting in reduced battery-life, as well as fans (or systems with fans) becoming active and audible. Apart from that the target device is running flawlessly and can take on additional work.
 * - 🟡 `"serious"`: Target device pressure, temperature and/or energy usage is consistently highly elevated. The system may be throttling as a countermeasure to reduce thermals.
 * - 🔴 `"critical"`: The temperature of the target device or system is significantly elevated and it requires cooling down to avoid any potential issues.
 * */
export type PressureRecordState = "nominal" | "fair" | "serious" | "critical"

/**
 * - `"thermals"`: represents the global thermal state of the entire system.
 * - `"cpu"`: represents the average pressure of the central processing unit (CPU) across all its cores. This state can be affected by other apps and sites than the observing site.
 */
export type PressureRecordSource = "thermals" | "cpu"

/**
 * - source: `PressureRecordSource`
 * - state: `PressureRecordState`
 * - time: A `DOMHighResTimeStamp` indicating the timestamp of the record.
 */
export interface PressureRecord {
  readonly source: PressureRecordSource
  readonly state: PressureRecordState
  readonly time: number
  /**
   * To get a JSON string, you can use JSON.stringify(lastRecord) directly; it will call toJSON() automatically.
   */
  toJSON: () => Pick<PressureRecord, 'source' | 'state' | 'time'>
}

/**
 * A callback that will be invoked when pressure records are observed. When the callback is invoked, the following parameters are available
 * - changes
 *  - An array containing all PressureRecord objects recorded since the last time the callback was called, or the last time the observer's takeRecords() method was called.
 * - observer
 *  - The observer object that is receiving the above records.
 */
export type PressureObserverCallback = (changes: readonly PressureRecord[], observer?: PressureObserver) => void

export interface PressureObserveOptions {
  /**
   * A number representing the requested sampling interval expressed in milliseconds.
   * Defaults to 0 meaning it will get updates as fast as the system can handle it.
   */
  readonly sampleInterval?: number
}

/**
 * Thrown if the Compute Pressure API is disallowed by a compute-pressure Permissions Policy.
 */
export type NotAllowedError = DOMException
/**
 * Thrown if the source parameter is not one of the supported sources for this user agent.
 */
export type NotSupportedError = DOMException

/**
 * This feature is not Baseline because it does not work in some of the most widely-used browsers.
 * - Experimental
 * - Note This feature is available in Web Workers, except for Service Workers.
 * - Secure context: This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.
 */
export declare class PressureObserver {
  /**
   * Creates and returns a new PressureObserver object.
   */
  constructor(callback: PressureObserverCallback)
  /**
   * Returns an array of source values supported by the user agent.
   * Note: The list of supported sources varies per browser, operating system, and hardware, and is evolving.
   * This property is merely a hint about source types the user agents supports.
   * Call observe() and check for a NotSupportedError to see if pressure observation is possible.
   * @example ```
   * PressureObserver.knownSources;
   *   // returns ["cpu"] in Chrome 125
   * ```
   **/
  static knownSources: readonly PressureRecordSource[]
  /**
   * Invokes the pressure observer's callback function when a pressure record for the specified source is observed.
   * @throws {NotAllowedError}
   * @throws {NotSupportedError}
   *
   * The observe() method of the PressureObserver interface tells the pressure observer to start observing pressure changes.
   * After this method is called, the observer will call its callback function when a pressure record for the specified source is observed.
   */
  observe: (source: PressureRecordSource, options?: PressureObserveOptions) => Promise<void | never>;
  /**
   * Stops the pressure observer callback from receiving pressure records from the specified source.
   */
  unobserve: () => void
  /**
   * Stops the pressure observer callback from receiving pressure records from all sources.
   */
  disconnect: () => void
  /**
   * Returns the current list of pressure records stored in the pressure observer, emptying it out.
   * It is useful when you want to a stop observing a source but would like to be sure to get any records that have not yet been passed into the observer callback.
   */
  takeRecords: () => PressureRecord[]
}

export async function example(): Promise<PressureObserver | undefined> {
  /**
   * the callback only gets invoked when the pressure changes from one value to the other
   */
  function callback(changes: readonly PressureRecord[]): void {
    const Logs = {
      nominal: "⚪ CPU Nominal",
      fair: "🟢 CPU Fair",
      serious: "🟡 CPU Serious",
      critical: "🔴 CPU Critical",
    } as const satisfies Record<PressureRecordState, string>

    const current = changes.at(-1)!;
    if (current.source === "cpu") {
      console.log(`${Logs[current.state]} @ ${current.time.toFixed(0)}ms`)
    }
  }

  function observe(options: PressureObserveOptions = { sampleInterval: 1000 }): PressureObserver | undefined {
    if (typeof PressureObserver === "undefined" || !(globalThis as { isSecureContext?: boolean }).isSecureContext) {
      return undefined
    }
    try {
      const observer = new PressureObserver(callback)
      observer.observe("cpu", options).catch(reason => {
        console.trace("Failed To Set Up Pressure Observer", reason)
      })
      return observer
    } catch (error) {
      console.trace("Failed To Set Up Pressure Observer", error)
    }
    return undefined
  }

  return observe()
}
