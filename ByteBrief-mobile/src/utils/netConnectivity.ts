import type { NetInfoState } from '@react-native-community/netinfo'

/**
 * フィードの注意喚起用。エミュレータでは isConnected だけでは誤検知しやすいので、
 * インターネット到達性と type を優先する。
 */
export function netStateLooksOffline(state: NetInfoState): boolean {
  if (state.isInternetReachable === true) return false
  if (state.isInternetReachable === false) return true
  if (state.type === 'none') return true
  return false
}
