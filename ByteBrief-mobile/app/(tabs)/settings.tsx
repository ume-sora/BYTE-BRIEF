import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Header } from '@/components/Header'
import {
  requestNotificationPermission,
  scheduleMorningNotification,
  cancelMorningNotification,
} from '@/notifications/morningBriefing'

const PREFS_KEY = 'byte-brief-notification-prefs'

interface NotificationPrefs {
  enabled: boolean
  hour: number
  minute: number
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  hour: 7,
  minute: 30,
}

const MINUTE_OPTIONS = [0, 15, 30, 45]
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

async function loadPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return {
      enabled: parsed.enabled ?? DEFAULT_PREFS.enabled,
      hour: typeof parsed.hour === 'number' ? parsed.hour : DEFAULT_PREFS.hour,
      minute:
        typeof parsed.minute === 'number' ? parsed.minute : DEFAULT_PREFS.minute,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

async function savePrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export default function SettingsScreen() {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [timeModalVisible, setTimeModalVisible] = useState(false)
  const [pickerHour, setPickerHour] = useState(DEFAULT_PREFS.hour)
  const [pickerMinute, setPickerMinute] = useState(DEFAULT_PREFS.minute)

  useEffect(() => {
    loadPrefs().then(setPrefs)
  }, [])

  const handleToggleEnabled = useCallback(
    async (value: boolean) => {
      const next = { ...prefs, enabled: value }
      setPrefs(next)
      await savePrefs(next)
      if (value) {
        const granted = await requestNotificationPermission()
        if (granted) {
          await scheduleMorningNotification(next.hour, next.minute)
        } else {
          setPrefs((p) => ({ ...p, enabled: false }))
          await savePrefs({ ...next, enabled: false })
        }
      } else {
        await cancelMorningNotification()
      }
    },
    [prefs]
  )

  const openTimeModal = useCallback(() => {
    setPickerHour(prefs.hour)
    setPickerMinute(prefs.minute)
    setTimeModalVisible(true)
  }, [prefs.hour, prefs.minute])

  const saveTime = useCallback(async () => {
    const next = { ...prefs, hour: pickerHour, minute: pickerMinute }
    setPrefs(next)
    await savePrefs(next)
    setTimeModalVisible(false)
    if (next.enabled) {
      await scheduleMorningNotification(next.hour, next.minute)
    }
  }, [prefs, pickerHour, pickerMinute])

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('settings.title')}</Text>

        <Text style={styles.rowLabel}>{t('settings.language')}</Text>
        <Text style={styles.rowHint}>JP / EN はヘッダーで切り替え</Text>

        <View style={styles.switchRow}>
          <Text style={styles.rowLabel}>{t('settings.notification_toggle')}</Text>
          <Switch
            value={prefs.enabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: '#374151', true: '#00D4FF' }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          onPress={openTimeModal}
          style={[
            styles.timeRow,
            !prefs.enabled && styles.timeRowDisabled,
          ]}
          disabled={!prefs.enabled}
        >
          <Text
            style={[
              styles.rowLabel,
              !prefs.enabled && styles.timeRowDisabledText,
            ]}
          >
            {t('settings.notification_time')}
          </Text>
          <Text
            style={[
              styles.timeValue,
              !prefs.enabled && styles.timeRowDisabledText,
            ]}
          >
            {formatTime(prefs.hour, prefs.minute)}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={timeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTimeModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.notification_time')}</Text>

            <View style={styles.pickerRow}>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={36}
                decelerationRate="fast"
              >
                {HOUR_OPTIONS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.pickerItem,
                      pickerHour === h && styles.pickerItemSelected,
                    ]}
                    onPress={() => setPickerHour(h)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        pickerHour === h && styles.pickerItemTextSelected,
                      ]}
                    >
                      {String(h).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.pickerSeparator}>:</Text>
              <ScrollView
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={36}
                decelerationRate="fast"
              >
                {MINUTE_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.pickerItem,
                      pickerMinute === m && styles.pickerItemSelected,
                    ]}
                    onPress={() => setPickerMinute(m)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        pickerMinute === m && styles.pickerItemTextSelected,
                      ]}
                    >
                      {String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setTimeModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('actions.close')}</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveTime}>
                <Text style={styles.saveBtnText}>保存</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0F14' },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4FF',
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E5E7EB',
  },
  rowHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  timeRowDisabled: {
    opacity: 0.5,
  },
  timeRowDisabledText: {
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00D4FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161B22',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E7EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pickerScroll: {
    height: 120,
    width: 72,
  },
  pickerItem: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#00D4FF20',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  pickerItemTextSelected: {
    color: '#00D4FF',
    fontWeight: '700',
  },
  pickerSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    marginHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1E2530',
  },
  cancelBtnText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#00D4FF',
  },
  saveBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
})
