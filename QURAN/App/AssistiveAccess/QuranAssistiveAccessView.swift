//
//  QuranAssistiveAccessView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

@available(iOS 26, *)
struct QuranAssistiveAccessView: View {
    @ObservedObject var presenter: SearchSurahPresenter
    
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
        .assistiveAccessNavigationIcon(systemImage: "book.fill")
        .onAppear {
            presenter.getAllSurah()
        }
    }
    
    func renderListSurah(_ listSurah: [SurahModel]) -> some View {
        List {
            ForEach(listSurah, id: \.id) { item in
                NavigationLink {
                    DetailSurahAssistiveAccessView(numberSurah: item.number)
                } label: {
                    Label(item.name.transliteration.indonesia, systemImage: "book.fill")
                }
            }
        }
        .listStyle(.automatic)
    }
}

@available(iOS 26, *)
#Preview(traits: .assistiveAccess) {
    @Previewable @StateObject var search = SearchSurahPresenter(SharedInjection.shared.provideQuran())
    NavigationStack {
        QuranAssistiveAccessView(presenter: search)
    }
}
