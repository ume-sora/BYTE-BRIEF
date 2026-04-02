package com.bytebrief.app
import com.facebook.react.common.assets.ReactFontManager

import android.app.Application
import android.content.res.Configuration
import android.os.Build
import android.preference.PreferenceManager

import com.facebook.react.PackageList
import com.facebook.react.R as ReactNativeR
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ExpoReactHostFactory

class MainApplication : Application(), ReactApplication {

  /**
   * 新しい AVD では FINGERPRINT が従来の "generic" パターンと一致せず、
   * Metro が localhost:8081 を見に行って接続失敗 → 添付の「Unable to load script」になる。
   * 未設定時のみホストマシン向けのエミュレータ用アドレスを書き込む（実機は従来どおり）。
   */
  private fun applyEmulatorMetroHostIfNeeded() {
    if (!BuildConfig.DEBUG) return
    val prefs = PreferenceManager.getDefaultSharedPreferences(this)
    if (!prefs.getString("debug_http_host", null).isNullOrEmpty()) return

    val port = resources.getInteger(ReactNativeR.integer.react_native_dev_server_port)
    val host =
      when {
        Build.FINGERPRINT.contains("vbox") -> "10.0.3.2"
        isLikelyAndroidEmulator() -> "10.0.2.2"
        else -> return
      }
    prefs.edit().putString("debug_http_host", "$host:$port").apply()
  }

  private fun isLikelyAndroidEmulator(): Boolean {
    val fp = Build.FINGERPRINT
    val model = Build.MODEL.lowercase()
    val product = Build.PRODUCT.lowercase()
    val hardware = Build.HARDWARE.lowercase()
    return fp.contains("generic") ||
      fp.startsWith("google/sdk_gphone") ||
      model.contains("google_sdk") ||
      model.contains("emulator") ||
      model.contains("android sdk built for") ||
      product.contains("sdk_gphone") ||
      product.contains("emulator") ||
      product.contains("simulator") ||
      hardware.contains("goldfish") ||
      hardware.contains("ranchu")
  }

  override val reactHost: ReactHost by lazy {
    ExpoReactHostFactory.getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        }
    )
  }

  override fun onCreate() {
    super.onCreate()
    applyEmulatorMetroHostIfNeeded()
    // @generated begin xml-fonts-init - expo prebuild (DO NOT MODIFY) sync-da39a3ee5e6b4b0d3255bfef95601890afd80709

    // @generated end xml-fonts-init
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
