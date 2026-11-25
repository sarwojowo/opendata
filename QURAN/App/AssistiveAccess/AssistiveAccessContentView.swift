//
//  AssistiveAccessContentView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

@available(iOS 26, *)
struct AssistiveAccessContentView: View {
    @EnvironmentObject private var searchPresenter: SearchSurahPresenter
    @EnvironmentObject private var prayerSchedulePresenter: PrayerSchedulePresenter
    
    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    QuranAssistiveAccessView(presenter: searchPresenter)
                } label: {
                    Label("Al-Quran", systemImage: "book.fill")
                }

                NavigationLink {
                    PrayerScheduleAssistiveAccessView(presenter: prayerSchedulePresenter)
                } label: {
                    Label("Prayer", systemImage: "moon.stars.fill")
                }
            }
        }
    }
}

@available(iOS 26, *)
#Preview(traits: .assistiveAccess) {
    @Previewable @StateObject var search = SearchSurahPresenter(SharedInjection.shared.provideQuran())
    @Previewable @StateObject var prayerSchedule = PrayerSchedulePresenter(Injection.init().providePrayerSchedule())
    
    AssistiveAccessContentView()
        .environmentObject(search)
        .environmentObject(prayerSchedule)
}
