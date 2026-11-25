//
//  DisabilityDoaView.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 14/10/25.
//

import SwiftUI

@available(iOS 16, *)
struct DisabilityDoaView: View {
    @State private var showSettings = false
    
    var body: some View {
        List {
            ForEach(DoaModel.listDoa, id: \.id) { doa in
                Section {
                    NavigationLink {
                        DoaDetailViewWrapper(doa: doa)
                    } label: {
                        Label(doa.source, systemImage: "text.book.closed.fill")
                            .font(.title2)
                            .padding(.all, 16)
                            .accessibilityLabel(Text("Dua \(doa.source)"))
                    }
                    .buttonStyle(.plain)
                    .accessibilityHint(Text("Double tap to open"))
                    .accessibilityInputLabels([
                        "navigate to duas \(doa.source)",
                        "go to duas \(doa.source)",
                        "select duas \(doa.source)",
                        "open duas \(doa.source)"
                    ])
                }
            }
        }
        .navigationTitle(Text("Dua"))
        .settingsToolbar(isPresented: $showSettings)
    }
}

@available(iOS 16, *)
#Preview {
    NavigationStack {
        DisabilityDoaView()
    }
}
