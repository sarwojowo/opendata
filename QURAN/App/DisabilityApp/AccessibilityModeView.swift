//
//  AccessibilityModeView.swift
//  Quran
//
//  Created by Ari Supriatna on 15/10/25.
//

import SwiftUI

struct AccessibilityModeView<AccessibilityContent: View, DefaultContent: View>: View {
    @AppStorage(AppStorageKey.accessibilityEnabled.rawValue) var accessibilityEnabled = false
    
    @ViewBuilder var accessibilityContent: () -> AccessibilityContent
    @ViewBuilder var defaultContent: () -> DefaultContent
    
    var body: some View {
        if accessibilityEnabled {
            accessibilityContent()
        } else {
            defaultContent()
        }
    }
}
