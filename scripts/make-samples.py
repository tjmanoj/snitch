"""
Generates the three illustrative sample screenshots in public/samples/.
They are INPUT images only. Every finding shown in the app is produced live by the model.
Run: python3 scripts/make-samples.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'samples')
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920

def font(size, bold=False):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(path, size)

def phone_frame(bg='#FFFFFF'):
    im = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(im)
    # status bar
    d.rectangle([0, 0, W, 90], fill=bg)
    d.text((48, 28), '9:41', font=font(34, True), fill='#111')
    d.text((W - 190, 30), '5G  ▮▮▮', font=font(30), fill='#111')
    return im, d

def rrect(d, box, r, fill=None, outline=None, width=2):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def checkbox(d, x, y, checked, color='#111'):
    rrect(d, [x, y, x + 40, y + 40], 8, fill='#F5C518' if checked else None, outline=color if not checked else '#F5C518', width=3)
    if checked:
        d.line([x + 9, y + 21, x + 17, y + 29, x + 32, y + 12], fill='#111', width=5)

# ---------------------------------------------------------------- 1. quick-commerce
im, d = phone_frame('#F6F6F8')
d.text((48, 120), '← Checkout', font=font(40, True), fill='#111')
d.text((W - 380, 128), 'Deliver in 9 mins', font=font(30), fill='#2E7D32')
# urgency banner
rrect(d, [48, 200, W - 48, 290], 18, fill='#FFE7E3', outline='#FF7043', width=3)
d.text((80, 224), '⏱  Only 2 delivery slots left — checkout in 04:59', font=font(30, True), fill='#C62828')
# items
y = 330
rrect(d, [48, y, W - 48, y + 300], 22, fill='#FFFFFF', outline='#E6E6EA')
d.text((80, y + 30), 'Your basket (3 items)', font=font(34, True), fill='#111')
for i, (name, price) in enumerate([('Amul Taaza Milk 1L', '₹66'), ('Brown Bread 400g', '₹45'), ('Bananas (6)', '₹48')]):
    d.text((80, y + 100 + i * 60), name, font=font(30), fill='#333')
    d.text((W - 200, y + 100 + i * 60), price, font=font(30), fill='#333')
# bill
y = 680
rrect(d, [48, y, W - 48, y + 520], 22, fill='#FFFFFF', outline='#E6E6EA')
d.text((80, y + 30), 'Bill details', font=font(34, True), fill='#111')
rows = [('Item total', '₹159'), ('Delivery fee', '₹0  (FREE)'), ('Platform fee', '₹30'), ('Small cart fee', '₹27'), ('Rain surcharge', '₹20'), ('Handling & packaging', '₹9')]
for i, (k, v) in enumerate(rows):
    d.text((80, y + 100 + i * 58), k, font=font(30), fill='#333')
    d.text((W - 260, y + 100 + i * 58), v, font=font(30), fill='#333')
d.line([80, y + 455, W - 80, y + 455], fill='#E6E6EA', width=2)
d.text((80, y + 470), 'To pay', font=font(34, True), fill='#111')
d.text((W - 260, y + 470), '₹245', font=font(34, True), fill='#111')
# pre-selected add-ons
y = 1240
rrect(d, [48, y, W - 48, y + 260], 22, fill='#FFFFFF', outline='#E6E6EA')
checkbox(d, 80, y + 34, True)
d.text((140, y + 34), 'Add Gold membership · ₹19/month', font=font(30, True), fill='#111')
d.text((140, y + 78), 'Auto-renews. Cancel anytime in settings.', font=font(24), fill='#777')
checkbox(d, 80, y + 150, True)
d.text((140, y + 150), 'Tip your delivery partner · ₹20', font=font(30, True), fill='#111')
d.text((140, y + 194), 'Thank you for your kindness!', font=font(24), fill='#777')
# CTA
rrect(d, [48, 1600, W - 48, 1710], 24, fill='#FF7043')
d.text((W // 2 - 200, 1630), 'Proceed to pay ₹284', font=font(38, True), fill='#FFF')
d.text((W // 2 - 170, 1740), 'By continuing you accept our T&C', font=font(24), fill='#999')
im.save(os.path.join(OUT, 'quick-commerce.png'), optimize=True)

# ---------------------------------------------------------------- 2. flight booking
im, d = phone_frame('#F4F7FB')
d.text((48, 120), '← Review & pay', font=font(40, True), fill='#111')
rrect(d, [48, 200, W - 48, 470], 22, fill='#FFFFFF', outline='#E3E8EF')
d.text((80, 230), 'BLR → DEL', font=font(40, True), fill='#111')
d.text((80, 290), 'Fri, 18 Sep · 06:10 – 08:55 · Non-stop', font=font(28), fill='#555')
d.text((80, 340), '3 travellers · Economy · Saver fare', font=font(28), fill='#555')
d.text((80, 400), 'Fare shown in search: ₹4,299 per traveller', font=font(26), fill='#888')
# fare breakdown
y = 520
rrect(d, [48, y, W - 48, y + 560], 22, fill='#FFFFFF', outline='#E3E8EF')
d.text((80, y + 30), 'Fare summary', font=font(34, True), fill='#111')
rows = [('Base fare × 3', '₹12,897'), ('Taxes & fees', '₹2,340'), ('Convenience fee × 3', '₹1,197'), ('Seat selection (auto-assigned)', '₹897'), ('Travel insurance × 3', '₹747'), ('Priority check-in', '₹299')]
for i, (k, v) in enumerate(rows):
    d.text((80, y + 100 + i * 60), k, font=font(28), fill='#333')
    d.text((W - 280, y + 100 + i * 60), v, font=font(28), fill='#333')
d.line([80, y + 480, W - 80, y + 480], fill='#E3E8EF', width=2)
d.text((80, y + 500), 'Total payable', font=font(34, True), fill='#111')
d.text((W - 280, y + 500), '₹18,377', font=font(34, True), fill='#111')
# insurance
y = 1120
rrect(d, [48, y, W - 48, y + 300], 22, fill='#FFFFFF', outline='#E3E8EF')
checkbox(d, 80, y + 34, True)
d.text((140, y + 30), 'Secure my trip with travel insurance', font=font(30, True), fill='#111')
d.text((140, y + 76), '₹249 per traveller · Covers delays and cancellations', font=font(24), fill='#777')
d.text((140, y + 150), 'No, I will risk my family’s trip', font=font(24), fill='#AAB2BD')
rrect(d, [80, y + 210, 520, y + 270], 12, fill='#0B57D0')
d.text((110, y + 224), 'Yes, protect my trip ✓', font=font(26, True), fill='#FFF')
# CTA
rrect(d, [48, 1520, W - 48, 1630], 24, fill='#0B57D0')
d.text((W // 2 - 190, 1550), 'Pay ₹18,377 now', font=font(38, True), fill='#FFF')
d.text((W // 2 - 300, 1660), 'Price may change if you leave this page · 3 seats left at this fare', font=font(22), fill='#C62828')
im.save(os.path.join(OUT, 'flight-booking.png'), optimize=True)

# ---------------------------------------------------------------- 3. subscription cancel
im, d = phone_frame('#101014')
d.text((48, 120), '← Manage plan', font=font(40, True), fill='#F1EFE9')
d.text((48, 200), 'Wait — before you go…', font=font(48, True), fill='#F1EFE9')
d.text((48, 270), 'You are about to lose everything you saved.', font=font(30), fill='#A9A8B0')
rrect(d, [48, 340, W - 48, 700], 24, fill='#1B1B21', outline='#33333C')
d.text((80, 372), 'Your watchlist (42 titles) will be deleted forever', font=font(28, True), fill='#F1EFE9')
d.text((80, 420), 'Your 4 profiles and download history will be erased', font=font(28), fill='#A9A8B0')
d.text((80, 468), 'You will lose your ₹149 loyalty price permanently', font=font(28), fill='#A9A8B0')
d.text((80, 540), 'Special offer: stay for ₹99/month for 2 months', font=font(28, True), fill='#F5C518')
d.text((80, 588), 'Offer expires in 09:59', font=font(26), fill='#FF7043')
rrect(d, [48, 760, W - 48, 870], 24, fill='#F5C518')
d.text((W // 2 - 170, 792), 'Keep my plan', font=font(38, True), fill='#111')
rrect(d, [48, 900, W - 48, 1010], 24, fill='#F5C518')
d.text((W // 2 - 200, 932), 'Pause instead (free)', font=font(38, True), fill='#111')
d.text((W // 2 - 150, 1060), 'continue cancelling', font=font(22), fill='#4A4A52')
d.text((48, 1180), 'Step 6 of 9', font=font(26), fill='#6E6E78')
rrect(d, [48, 1220, W - 48, 1250], 10, fill='#23232B')
rrect(d, [48, 1220, 700, 1250], 10, fill='#FF7043')
d.text((48, 1290), 'To finish, you will also need to:', font=font(28), fill='#A9A8B0')
d.text((48, 1340), '• Complete a short 8-question survey', font=font(28), fill='#A9A8B0')
d.text((48, 1390), '• Confirm by phone during office hours (Mon–Fri 10–5)', font=font(28), fill='#A9A8B0')
d.text((48, 1440), '• Enter your password again', font=font(28), fill='#A9A8B0')
d.text((48, 1560), 'Turn on notifications so we can remind you to come back?', font=font(26), fill='#A9A8B0')
rrect(d, [48, 1610, 480, 1690], 16, fill='#2DD4BF')
d.text((120, 1632), 'Yes, notify me', font=font(30, True), fill='#111')
d.text((540, 1636), 'Not now (ask me again tomorrow)', font=font(24), fill='#6E6E78')
im.save(os.path.join(OUT, 'subscription-cancel.png'), optimize=True)

print('wrote 3 samples to', os.path.abspath(OUT))
