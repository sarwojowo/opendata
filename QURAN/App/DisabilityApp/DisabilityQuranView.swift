//
//  DisabilityQuranView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

struct DisabilityQuranView: View {
    @ObservedObject var presenter: SearchSurahPresenter
    @ScaledMetric var paddingTrailing = 24.0
    @ScaledMetric var paddingLeading = 8.0
    @ScaledMetric var padding = 16.0
    @State private var showSettings = false
    
    var body: some View {
        ZStack {
            switch presenter.state {
            case .loading:
                renderListSurah(SurahModel.stubs)
            case .loaded(let listSurah):
                renderListSurah(listSurah)
            case .empty(let message):
                MessageView(message: message)
            case .error(let errMessage):
                MessageView(message: errMessage)
            }
        }
        .navigationTitle(Text("Al-Qur'an"))
        .settingsToolbar(isPresented: $showSettings)
        .onAppear {
            presenter.getAllSurah()
        }
    }
    
    func renderListSurah(_ listSurah: [SurahModel]) -> some View {
        List {
            ForEach(listSurah, id: \.id) { item in
                Section {
                    presenter.routeToPage(.surahDetail(numberSurah: item.number)) {
                        QPDynamicLayoutView {
                            surahItemView(item: item)
                        } bodyXXLarge: {
                            surahItemViewXXLarge(item: item)
                        } bodyAccessibility2: {
                            surahItemViewXXLarge(item: item)
                        }
                    }
                    .accessibilityHint(Text("Double tap to open"))
                }
            }
        }
        .listStyle(.automatic)
    }
    
    func surahItemView(item: SurahModel) -> some View {
        HStack(alignment: .center) {
            AyahNumberView(numberAyah: item.number)
                .padding(.trailing, paddingTrailing)
                .padding(.leading, paddingLeading)
                .accessibilityLabel(Text("Surah \(item.number)"))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(surahName(translation: item.name.transliteration))
                    .font(.title2)
                    .fontWeight(.medium)
                
                HStack {
                    Text(item.revelation.indonesia.uppercased())
                        .fontWeight(.medium)
                        .font(.body)
                        .accessibilityLabel(Text(item.revelation.indonesia))
                    
                    Circle()
                        .fill(Color(.loblolly).opacity(0.3))
                        .frame(width: 6, height: 6)
                    
                    Text("\(item.numberOfVerses) Ayah".uppercased())
                        .fontWeight(.medium)
                        .font(.body)
                        .accessibilityLabel(Text("This surah has \(item.numberOfVerses) ayah"))
                }
                .foregroundColor(.secondary)
            }
        }
        .padding(.all, padding)
        .accessibilityElement(children: .combine)
        .accessibilityInputLabels(["surah \(surahName(translation: item.name.transliteration))"])
    }
    
    func surahItemViewXXLarge(item: SurahModel) -> some View {
        HStack(alignment: .center) {
            AyahNumberView(numberAyah: item.number)
                .padding(.trailing, paddingTrailing)
                .padding(.leading, paddingLeading)
                .accessibilityLabel(Text("Surah \(item.number)"))
            
            VStack(alignment: .leading) {
                Text(surahName(translation: item.name.transliteration))
                    .font(.title2)
                    .fontWeight(.medium)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.revelation.indonesia.uppercased())
                        .fontWeight(.medium)
                        .font(.body)
                        .accessibilityLabel(Text(item.revelation.indonesia))
                    
                    Text("\(item.numberOfVerses) Ayah".uppercased())
                        .fontWeight(.medium)
                        .font(.body)
                        .accessibilityLabel(Text("This surah has \(item.numberOfVerses) ayah"))
                }
                .foregroundColor(.secondary)
            }
        }
        .padding(.all, padding)
        .accessibilityElement(children: .combine)
        .accessibilityInputLabels(["surah \(surahName(translation: item.name.transliteration))"])
    }
    
    func surahName(translation: SurahTransliterationModel) -> String {
        if Locale.current.identifier == "id_ID" {
            return translation.indonesia
        } else {
            return translation.english
        }
    }
}

@available(iOS 17, *)
#Preview {
    @Previewable @StateObject var search = SearchSurahPresenter(SharedInjection.shared.provideQuran())
    NavigationStack {
        DisabilityQuranView(presenter: search)
    }
}
