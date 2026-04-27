function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty("SHEET_ID");
    var sheetName = props.getProperty("SHEET_NAME") || "RSVP";

    if (!sheetId) {
      return jsonOutput({ ok: false, message: "SHEET_ID missing" }, 500);
    }

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["timestamp", "name", "guestCount", "answer", "createdAt", "userAgent", "ip"]);
    }

    var payload = parsePayload(e);

    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.guestCount || "",
      payload.answer || "",
      payload.createdAt || "",
      payload.userAgent || "",
      payload.ip || ""
    ]);

    return jsonOutput({ ok: true });
  } catch (err) {
    return jsonOutput({ ok: false, message: String(err) }, 500);
  }
}

function doGet() {
  return jsonOutput({ ok: true, service: "rsvp-endpoint" });
}

function parsePayload(e) {
  var raw = e && e.postData && e.postData.contents;
  if (!raw) {
    return e && e.parameter ? e.parameter : {};
  }

  var type = (e.postData.type || "").toLowerCase();
  if (type.indexOf("application/json") !== -1) {
    return JSON.parse(raw);
  }

  if (type.indexOf("application/x-www-form-urlencoded") !== -1) {
    return e.parameter || {};
  }

  try {
    return JSON.parse(raw);
  } catch (_) {
    return e.parameter || {};
  }
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
