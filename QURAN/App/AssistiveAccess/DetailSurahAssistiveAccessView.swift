//
//  DetailSurahAssistiveAccessView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

@available(iOS 26, *)
struct DetailSurahAssistiveAccessView: View {
    private var numberSurah: Int
    
    init(numberSurah: Int) {
        self.numberSurah = numberSurah
    }
    
    @StateObject private var presenter = DetailSurahPresenter(SharedInjection.shared.provideDetail())
    
    var body: some View {
        DetailSurahContainer(state: presenter.state) { surahDetail, _ in
            ForEach(surahDetail.verses, id: \.identifier) { item in
                ayahItemView(item: item)
            }
        } placeholder: { _ in
            ForEach(SurahDetailModel.stub.verses, id: \.identifier) { item in
                ayahItemView(item: item)
            }
        }
        .navigationTitle(Text("Detail Surah"))
        .assistiveAccessNavigationIcon(systemImage: "book.fill")
        .onAppear {
            presenter.getSurahDetail(with: numberSurah)
        }
    }
    
    private func arabicTextView(text: String) -> some View {
        Text(text)
            .fontWeight(.semibold)
            .font(.custom("hafs", size: 36, relativeTo: .title3))
            .lineLimit(nil)
            .lineSpacing(16.0)
            .multilineTextAlignment(.trailing)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .trailing)
    }
    
    private func ayahItemView(item: AyahModel) -> some View {
        VStack(alignment: .trailing, spacing: 16) {
            NumberSurahView(numberAyah: item.number.inSurah)
            arabicTextView(text: item.text.arab)
        }
        .padding(.all)
        .frame(maxWidth: .infinity)
    }
        
}

@available(iOS 26, *)
#Preview(traits: .assistiveAccess) {
    NavigationStack {
        DetailSurahAssistiveAccessView(numberSurah: 2)
    }
}
