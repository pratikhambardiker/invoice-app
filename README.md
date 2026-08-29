# Quill — simple invoices

A small invoicing app for freelancers and small businesses.

You can:

- Create and edit invoices
- Keep a list of clients and see what they owe
- Preview an invoice that looks ready to send
- Print it, or save it as a PDF
- Mark invoices as sent or paid
- Keep your business details in Settings

**Your invoices stay in your browser.** They are not uploaded to the internet. If you switch computers, use a different browser, or clear this site’s data, they will not be there.

The first time you open the app, you’ll see a few sample invoices so it isn’t empty. Use **Clear sample data** when you want to start with your own.

Default currency is **AED** (UAE Dirham). You can change it to USD, EUR, GBP, or INR in Settings.

---

## How to use it (no coding)

The easiest way is to open the app in a web browser after it has been published (for example on Vercel). Bookmark that page and use it like any other website.

If this project is on GitHub and you want your own copy online:

1. Create a free account at [vercel.com](https://vercel.com)
2. Click **Add New… → Project**
3. Import this GitHub repository
4. Click **Deploy**
5. Open the website Vercel gives you

You do not need to change any settings. There is no login and no secret keys.

---

## If someone is helping you on a computer

They can run it locally with Node.js:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To make a production build:

```bash
npm run build
npm start
```

---

## Good to know

- No account. No database. Everything is saved with **localStorage** in your browser.
- **Download PDF** opens the print window. Choose **Save as PDF** as the printer.
- You can export a CSV of your invoices from the home page, and copy a payment reminder email from an invoice.
