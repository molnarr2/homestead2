import { LegalPage } from './LegalPage'
import { SITE } from '../../config/site'

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Veterinary Disclaimer"
      path="/disclaimer"
      description={`Important disclaimer for the free ${SITE.appName} homestead tools — for planning only, not veterinary advice.`}
    >
      <p>
        The calculators, schedules, and reference values on this site are provided for
        <strong> general planning and educational purposes only</strong>. They are not veterinary
        advice and must not be used as a substitute for professional diagnosis, treatment, or the
        instructions on a medication's label.
      </p>
      <h2>Medication withdrawal periods</h2>
      <p>
        Withdrawal periods vary by product, dose, route of administration, species, and country. The
        preset values here are conservative, indicative figures only. <strong>Always confirm the
        correct withdrawal period against the product label and with your veterinarian</strong> before
        selling or consuming milk, meat, or eggs from a treated animal.
      </p>
      <h2>Gestation, scheduling, and cost tools</h2>
      <p>
        Gestation lengths and care intervals are averages; individual animals and regional best
        practices vary. Cost figures are estimates based on the numbers you enter.
      </p>
      <h2>No liability</h2>
      <p>
        {SITE.appName} and its authors accept no liability for any loss or harm arising from reliance
        on these tools. Use them as a starting point and verify with qualified professionals.
      </p>
    </LegalPage>
  )
}
