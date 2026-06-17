import { LegalPage } from './LegalPage'
import { SITE } from '../../config/site'

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      path="/terms"
      description={`Terms of use for the ${SITE.appName} website and its free homestead tools.`}
    >
      <p>
        By using this website you agree to these terms. The content and tools are provided “as is,”
        without warranties of any kind.
      </p>
      <h2>Acceptable use</h2>
      <p>
        You may use the free tools and printables for your own homestead or farm. Please don’t scrape,
        resell, or misrepresent the content as professional advice.
      </p>
      <h2>Not professional advice</h2>
      <p>
        The tools are for planning only. See our <a href="/disclaimer">veterinary disclaimer</a> for
        the important details on medication withdrawal and animal health.
      </p>
      <h2>Contact</h2>
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with any questions.
      </p>
    </LegalPage>
  )
}
