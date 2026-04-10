import re
import colorsys

def hex_to_hsl(hex_color):
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s, l

def hsl_to_hex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360.0, l, s)
    return "#{:02x}{:02x}{:02x}".format(int(r * 255), int(g * 255), int(b * 255))

def shift_hue_to_red(text):
    # Regex to find hex colors
    def hex_replacer(match):
        hex_color = match.group(0)
        if len(hex_color) == 7:
            h, s, l = hex_to_hsl(hex_color)
            # Orange is ~10-40 degrees. Let's shift anything in 0-50 to 0 (red)
            if 0 <= h <= 50 and s > 0.1:
                return hsl_to_hex(0, s, l)
        return hex_color

    text = re.sub(r'#[0-9a-fA-F]{6}', hex_replacer, text)
    
    # Regex to find rgba
    def rgba_replacer(match):
        r, g, b, a = match.groups()
        r, g, b = int(r), int(g), int(b)
        h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
        h *= 360
        if 0 <= h <= 50 and s > 0.1:
            r_new, g_new, b_new = colorsys.hls_to_rgb(0, l, s)
            return f"rgba({int(r_new*255)}, {int(g_new*255)}, {int(b_new*255)}, {a})"
        return match.group(0)

    text = re.sub(r'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)', rgba_replacer, text)
    
    return text

file_path = "r:\\Rehan's Code\\The Rehan Kadri\\portfolio\\src\\components\\blog\\posts\\youtube-stats-visuals.module.css"
with open(file_path, "r", encoding="utf-8") as f:
    css = f.read()

new_css = shift_hue_to_red(css)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_css)

print("Done shifting css.")

tsx_path = "r:\\Rehan's Code\\The Rehan Kadri\\portfolio\\src\\components\\blog\\posts\\YouTubeChannelStatisticsArticle.tsx"
with open(tsx_path, "r", encoding="utf-8") as f:
    tsx = f.read()
    
new_tsx = shift_hue_to_red(tsx)

with open(tsx_path, "w", encoding="utf-8") as f:
    f.write(new_tsx)
    
print("Done shifting tsx.")
