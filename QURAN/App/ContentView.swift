//
//  ContentView.swift
//  Shared
//
//  Created by Ari Supriatna on 19/03/21.
//

import SwiftUI

struct ContentView: View {
    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    #endif
    
    @AppStorage(AppStorageKey.accessibilityEnabled.rawValue) var accessibilityEnabled = false
    @State private var isSwitchingMode = false
    
    @ViewBuilder var body: some View {
        Group {
            #if os(iOS)
            if isSwitchingMode {
                VStack(spacing: 16) {
                    ProgressView()
                    Text("Changing Mode...")
                        .foregroundStyle(.secondary)
                }
            } else {
                AccessibilityModeView {
                    if #available(iOS 18.0, *) {
                        DisabilityContentView()
                    } else {
                        // Fallback for older iOS versions if needed
                        Text("Accessibility Mode requires iOS 18 or newer.")
                    }
                } defaultContent: {
                    if horizontalSizeClass == .compact {
                        AppTabNavigation()
                    } else {
                        AppSidebarNavigationForiPad()
                    }
                }
            }
            #else
            AppSidebarNavigationForMac()
            #endif
        }
        .availableContent {
            if #available(iOS 18, *) {
                $0.onChange(of: accessibilityEnabled) { wasEnabled, isEnabled in
                    // No need to check the new value, just trigger the loading sequence.
                    isSwitchingMode = true

                    // Simulate a delay for the transition to feel deliberate.
                    // Replace with actual setup/teardown tasks if needed.
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                        // After the delay, hide the loader to reveal the new view.
                        isSwitchingMode = false
                    }
                }
            } else {
                $0
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
