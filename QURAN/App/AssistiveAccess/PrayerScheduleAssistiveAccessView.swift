//
//  PrayerScheduleAssistiveAccessView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

@available(iOS 26, *)
struct PrayerScheduleAssistiveAccessView: View {
    @ObservedObject var presenter: PrayerSchedulePresenter
    @AppStorage(
        AppStorageKey.cityId.rawValue,
        store: UserDefaults(suiteName: "group.com.arisupriatna.Quran")
    ) var cityId = "1301"
    private let helper = PrayerScheduleHelper()
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        ZStack {
            switch presenter.dailyScheduleState {
            case .loading:
                listOfPrayerSchedule(.stub).redacted(reason: .placeholder)
            case .loaded(let schedule, _):
                listOfPrayerSchedule(schedule)
            case .empty(let message):
                MessageView(message: message)
            case .error(let errMessage):
                MessageView(message: errMessage)
            }
        }
        .navigationTitle(Text("Prayer"))
        .assistiveAccessNavigationIcon(systemImage: "moon.stars.fill")
        .task {
            try? await self.presenter.getPrayerSchedulePerDay(with: cityId)
        }
    }
    
    func listOfPrayerSchedule(_ schedule: ScheduleModel) -> some View {
        List {
            prayerScheduleItemView(
                prayerName: "Imsak",
                prayerTime: schedule.imsak,
                prayerIcon: "moon.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.imsak
            )
            prayerScheduleItemView(
                prayerName: "Subuh",
                prayerTime: schedule.subuh,
                prayerIcon: "moon.haze.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.subuh
            )
            prayerScheduleItemView(
                prayerName: "Terbit",
                prayerTime: schedule.terbit,
                prayerIcon: "sun.haze.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.terbit
            )
            prayerScheduleItemView(
                prayerName: "Dhuha",
                prayerTime: schedule.dhuha,
                prayerIcon: "sun.horizon.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.dhuha
            )
            prayerScheduleItemView(
                prayerName: "Dzuhur",
                prayerTime: schedule.dzuhur,
                prayerIcon: "sun.max.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.dzuhur
            )
            prayerScheduleItemView(
                prayerName: "Ashar",
                prayerTime: schedule.ashar,
                prayerIcon: "sun.min.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.ashar
            )
            prayerScheduleItemView(
                prayerName: "Maghrib",
                prayerTime: schedule.maghrib,
                prayerIcon: "sunset.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.maghrib
            )
            prayerScheduleItemView(
                prayerName: "Isya",
                prayerTime: schedule.isya,
                prayerIcon: "moon.stars.fill",
                isCurrentPrayer: currentNextPrayer(schedule) == schedule.isya
            )
        }
    }
    
    func prayerScheduleItemView(prayerName: String, prayerTime: String, prayerIcon: String, isCurrentPrayer: Bool) -> some View {
        VStack(alignment: .center) {
            Label("", systemImage: prayerIcon)
                .font(.title)
            
            Text(prayerName)
                .font(.title2)
                .fontWeight(.semibold)
            
            Spacer()
            
            Text(prayerTime)
                .font(.title2)
                .fontWeight(.semibold)
        }
        .padding(.all, 16)
        .frame(maxWidth: .infinity)
        .background(isCurrentPrayer ? Color(.meteorite) : Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 16.0))
        .foregroundStyle(colorScheme == .light && isCurrentPrayer == false ? Color(.rhino) : Color(.catskillWhite))
        .padding(.vertical, 8)
    }
    
    func currentNextPrayer(_ schedule: ScheduleModel) -> String {
        return helper.getNextPrayerSchedule(schedule).nextPrayerTime
    }
}

@available(iOS 26, *)
#Preview(traits: .assistiveAccess) {
    NavigationStack {
        PrayerScheduleAssistiveAccessView(presenter: .init(Injection.init().providePrayerSchedule()))
    }
}
