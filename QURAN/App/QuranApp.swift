//
//  QuranApp.swift
//  Shared
//
//  Created by Ari Supriatna on 19/03/21.
//

import AppIntents
import SwiftUI
import Firebase

#if os(iOS)
import Sentry
#endif

@main
struct QuranApp: App {
    #if DEBUG
    let environment = "debug"
    #else
    let environment = "release"
    #endif
    
    @Environment(\.scenePhase) private var phase
    @StateObject private var prayerSchedulePresenter = PrayerSchedulePresenter(Injection.shared.providePrayerSchedule())
    
    #if os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    private let actionService = QuickActionService.shared
    private let controlWidgetRouter: ControlWidgetRouter
    #endif
    
    init() {
        #if os(iOS)
        if #available(iOS 18, *) {
            let controlRouter = ControlWidgetRouter.shared
            controlWidgetRouter = controlRouter
            AppDependencyManager.shared.add(dependency: controlRouter)
        } else {
            controlWidgetRouter = .shared
        }
        
        FirebaseApp.configure()
//        setupSentry()
        #endif
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .registerEnvironmentObject()
                #if os(iOS)
                .availableContent {
                    if UIDevice.current.userInterfaceIdiom == .phone {
                        $0.dynamicTypeSize(...DynamicTypeSize.accessibility2)
                    } else {
                        $0.dynamicTypeSize(...DynamicTypeSize.accessibility5)
                    }
                }
                .environmentObject(actionService)
                .environmentObject(controlWidgetRouter)
                #endif
        }
        #if os(iOS)
        .onChange(of: phase) { scene in
            setupColorScheme()
        }
        #endif
        
        #if os(macOS)
        Settings {
            if #available(macOS 13.0, *) {
                SettingsForMacView()
                    .frame(minWidth: 500, maxWidth: 600)
            } else {
                NavigationView {
                    SettingsView()
                        .frame(minWidth: 400, maxWidth: 500, minHeight: 300, maxHeight: 400)
                }
            }
        }
        
        if #available(macOS 13.0, *) {
            MenuBarExtra("Prayer Schedule", systemImage: "moon.stars.fill") {
                NavigationStack {
                    PrayerScheduleView(presenter: prayerSchedulePresenter).frame(height: 600)
                }
            }
            .menuBarExtraStyle(.window)
        }
        #endif
        
        if #available(iOS 26, *) {
            AssistiveAccess {
                AssistiveAccessContentView()
                    .registerEnvironmentObject()
            }
        }
    }
}

extension QuranApp {
    #if os(iOS)
    func setupSentry() {
        SentrySDK.start { options in
            options.dsn = AppConstant.dsn
            options.debug = true
            options.environment = self.environment
            options.tracesSampleRate = 1.0
        }
    }
    #endif
    
    #if os(iOS)
    private func setupColorScheme() {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first as? UIWindowScene
        let window = windowScene?.windows.first
        window?.tintColor = UIColor(named: "AccentColor")
    }
    #endif
}

struct QPNavigationView<Content: View>: View {
    @ViewBuilder var content: () -> Content
    
    @ViewBuilder
    var body: some View {
        if #available(iOS 16.0, macOS 13.0, *) {
            NavigationStack {
                content()
            }
        } else {
            NavigationView {
                content()
            }
        }
    }
}
