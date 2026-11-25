//
//  AppDelegate.swift
//  Quran (iOS)
//
//  Created by Ari Supriatna on 24/02/22.
//

import UIKit
import SwiftUI
import BackgroundTasks

class AppDelegate: UIResponder, UIApplicationDelegate {
  private let actionService = QuickActionService.shared
  
  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    if let shortcutItem = options.shortcutItem {
      actionService.action = QuickAction(shortcutItem: shortcutItem)
    }
    
    let configuration = UISceneConfiguration(
      name: connectingSceneSession.configuration.name,
      sessionRole: connectingSceneSession.role
    )
    configuration.delegateClass = SceneDelegate.self
    
    return configuration
  }
}

class SceneDelegate: NSObject, UIWindowSceneDelegate {
  private let actionService = QuickActionService.shared
  @SceneStorage("tab") var tab: TabItem = .home
  
  func windowScene(
    _ windowScene: UIWindowScene,
    performActionFor shortcutItem: UIApplicationShortcutItem,
    completionHandler: @escaping (Bool) -> Void
  ) {
    actionService.action = QuickAction(shortcutItem: shortcutItem)
    completionHandler(true)
  }
}
