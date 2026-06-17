import { LegalPage } from './LegalPage'
import { SITE } from '../../config/site'

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy"
      description={`How ${SITE.appName} handles data on this website. The free tools run entirely in your browser — no account, no server-side storage.`}
    >
      <p>
        This website is built to need as little of your data as possible. The free tools run entirely
        in your browser. Numbers you type into a calculator are never sent to a server and are not
        stored after you leave the page.
      </p>
      <h2>Analytics</h2>
      <p>
        With your consent, we use privacy-friendly analytics to understand which tools are useful and
        how visitors find them. You can decline analytics from the consent banner; nothing loads until
        you accept.
      </p>
      <h2>Email</h2>
      <p>
        If you choose to enter your email to receive a printable, we use it only to send what you
        requested and occasional related updates. You can unsubscribe at any time.
      </p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </LegalPage>
  )
}
