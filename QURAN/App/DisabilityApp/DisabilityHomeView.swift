//
//  DisabilityHomeView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

enum DisabilityMenu: String, CaseIterable, Identifiable {
    case quran
    case quranTheme
    case prayer
    case hadith
    case doa
    
    var id: String { self.rawValue }
    
    var title: LocalizedStringKey {
        switch self {
        case .quran: return "Al-Quran"
        case .quranTheme: return "Quran Themes"
        case .prayer: return "Prayer"
        case .hadith: return "Hadith"
        case .doa: return "Dua"
        }
    }
    
    var icon: String {
        switch self {
        case .quran: return "book.fill"
        case .quranTheme: return "book.pages.fill"
        case .prayer: return "moon.stars.fill"
        case .hadith: return "books.vertical.fill"
        case .doa: return "text.book.closed.fill"
        }
    }
    
    var accessibilityLabel: LocalizedStringKey {
        switch self {
            case .quran: return "Menu Al-Quran"
            case .quranTheme: return "Menu Quran Themes"
            case .prayer: return "Menu Prayer"
            case .hadith: return "Menu Hadith"
            case .doa: return "Menu Doa"
        }
    }
}

@available(iOS 16.0, *)
struct DisabilityHomeView: View {
    @EnvironmentObject private var homePresenter: HomePresenter
    @EnvironmentObject private var searchPresenter: SearchSurahPresenter
    @EnvironmentObject private var prayerSchedulePresenter: PrayerSchedulePresenter
    
    @State private var showSettings = false
    
    var body: some View {
        List {
            ForEach(DisabilityMenu.allCases) { menu in
                Section {
                    NavigationLink {
                        destination(for: menu)
                    } label: {
                        Label(menu.title, systemImage: menu.icon)
                            .font(.title2)
                            .padding(.all, 16)
                            .accessibilityLabel(Text(menu.accessibilityLabel))
                            .accessibilityHint(Text("Double tap to open"))
                    }
                }
            }
        }
        .navigationTitle(Text("Quran App"))
        .settingsToolbar(isPresented: $showSettings)
        .task {
            if homePresenter.quranThemeState.value == nil {
                try? await homePresenter.getQuranTheme()
            }
        }
        .onAppear {
            if homePresenter.listHadithBooks == nil {
                homePresenter.getAllHadithBooks()
            }
        }
    }
    
    @ViewBuilder
    private func destination(for menu: DisabilityMenu) -> some View {
        switch menu {
        case .quran:
            DisabilityQuranView(presenter: searchPresenter)
        case .quranTheme:
            ListQuranThemeViewWrapper(title: "Quran Themes", quranThemes: homePresenter.quranThemeState.value ?? [])
        case .prayer:
            PrayerScheduleView(presenter: prayerSchedulePresenter)
        case .hadith:
            ListHadithBooksView(listHadithBooks: homePresenter.listHadithBooks ?? [])
        case .doa:
            DisabilityDoaView()
        }
    }
}

@available(iOS 16.0, *)
#Preview {
    NavigationStack {
        DisabilityHomeView().registerEnvironmentObject()
    }
}
