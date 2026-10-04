package com.capsuleforge.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/**
 * CapsuleForge — WebView wrapper around the 100% client-side studio
 * (index.html + studio.js in assets/). The page calls
 * window.AndroidBridge.savePNG(name, dataUrl) for exports, which lands
 * in the device's Pictures/CapsuleForge gallery folder.
 *
 * Zero external dependencies — plain framework APIs only, so the build
 * works fully offline.
 */
public class MainActivity extends Activity {
    private static final int REQ_PICK_IMAGES = 1001;
    private WebView web;
    private ValueCallback<Uri[]> fileChooser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                // keep the studio in-app; open everything else in the browser
                if (u != null && !"file".equals(u.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, u));
                    return true;
                }
                return false;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileChooser != null) fileChooser.onReceiveValue(null);
                fileChooser = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "Select screenshots"), REQ_PICK_IMAGES);
                } catch (Exception e) {
                    fileChooser = null;
                    return false;
                }
                return true;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_PICK_IMAGES && fileChooser != null) {
            Uri[] uris = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int n = data.getClipData().getItemCount();
                    uris = new Uri[n];
                    for (int i = 0; i < n; i++) uris[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    uris = new Uri[]{data.getData()};
                }
            }
            fileChooser.onReceiveValue(uris);
            fileChooser = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    /** Called from studio.js: window.AndroidBridge.savePNG(name, dataUrl). */
    class Bridge {
        @JavascriptInterface
        public void savePNG(final String name, final String dataUrl) {
            runOnUiThread(() -> {
                try {
                    String b64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
                    byte[] png = Base64.decode(b64, Base64.DEFAULT);
                    String saved = writeToGallery(name, png);
                    Toast.makeText(MainActivity.this,
                            saved != null ? "Saved: " + saved : "Save failed",
                            Toast.LENGTH_LONG).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this,
                            "Save failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        private String writeToGallery(String name, byte[] png) throws Exception {
            ContentResolver cr = getContentResolver();
            ContentValues cv = new ContentValues();
            cv.put(MediaStore.Images.Media.DISPLAY_NAME, name);
            cv.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            OutputStream os;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                cv.put(MediaStore.Images.Media.RELATIVE_PATH,
                        Environment.DIRECTORY_PICTURES + "/CapsuleForge");
                Uri uri = cr.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                if (uri == null) return null;
                os = cr.openOutputStream(uri);
            } else {
                // pre-Q: app-private pictures dir (no permission needed)
                File dir = new File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), "CapsuleForge");
                //noinspection ResultOfMethodCallIgnored
                dir.mkdirs();
                File f = new File(dir, name);
                os = new FileOutputStream(f);
                sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(f)));
            }
            if (os == null) return null;
            try {
                os.write(png);
            } finally {
                os.close();
            }
            return name;
        }
    }
}
