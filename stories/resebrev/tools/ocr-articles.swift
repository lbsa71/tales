import AppKit
import Foundation
import Vision

let args = Array(CommandLine.arguments.dropFirst())

guard args.count >= 2 else {
    FileHandle.standardError.write(Data("Usage: swift ocr-articles.swift OUTPUT_DIR IMAGE...\n".utf8))
    exit(2)
}

let outputDir = URL(fileURLWithPath: args[0])
let imagePaths = Array(args.dropFirst())

try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

func recognizeText(in imageURL: URL) throws -> String {
    guard let image = NSImage(contentsOf: imageURL),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
    else {
        throw NSError(domain: "OCR", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not load image \(imageURL.path)"])
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true
    request.recognitionLanguages = ["sv-SE", "en-US"]

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])

    let observations = request.results ?? []
    return observations
        .compactMap { $0.topCandidates(1).first?.string }
        .joined(separator: "\n")
}

var combined: [String] = []

for path in imagePaths {
    let imageURL = URL(fileURLWithPath: path)
    let text = try recognizeText(in: imageURL)
    let stem = imageURL.deletingPathExtension().lastPathComponent
    let outURL = outputDir.appendingPathComponent(stem + ".ocr.txt")
    try text.write(to: outURL, atomically: true, encoding: String.Encoding.utf8)

    combined.append("# \(imageURL.lastPathComponent)")
    combined.append("")
    combined.append(text)
    combined.append("")
}

try combined.joined(separator: "\n").write(
    to: outputDir.appendingPathComponent("articles.ocr.combined.md"),
    atomically: true,
    encoding: String.Encoding.utf8
)
