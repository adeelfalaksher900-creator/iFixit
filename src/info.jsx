import React from "react";
import { BookOpen, ArrowUpRight, Logo, Button } from "./ui.jsx";
export function Research() {
  return (
    <div className="prose">
      <h1>Built around a missing part.</h1>
      <p className="lead">
        A repair stalls. A useful part sits elsewhere. RepairRelay helps a local
        coordinator connect the two and keep an honest record of what happens
        next.
      </p>
      <section>
        <h2>What the evidence tells us</h2>
        <p>
          The Open Repair Alliance's 2024 analysis reported unavailable parts in
          25% of recorded repair barriers, and expensive parts in 18%. These are
          community repair records from its dataset, not measurements of our
          neighborhood.
        </p>
        <a
          href="https://openrepair.org/open-data/insights/2024-report/supporting-data/"
          target="_blank"
          rel="noreferrer"
        >
          Read the supporting data <ArrowUpRight size={15} />
        </a>
        <p>
          Restarters' parts guidance describes model-specific assemblies,
          mislabeled used parts and the importance of checking specifications.
          This is why our comparison shows every field and leaves the physical
          decision to the technician.
        </p>
        <a
          href="https://wiki.restarters.net/Spare_parts"
          target="_blank"
          rel="noreferrer"
        >
          Read the spare-parts guidance <ArrowUpRight size={15} />
        </a>
      </section>
      <section>
        <h2>The gap we chose</h2>
        <p>
          iFixit provides repair guides and parts. Restarters supports community
          repair and records repair outcomes. RepairRelay focuses on one narrow
          workflow: a diagnosed local request, a donated part, a documented
          technician check, a donor handover receipt, and an owner-confirmed
          repair outcome.
        </p>
        <p>
          This is a proposed workflow improvement, not a claim that no similar
          product exists.
        </p>
      </section>
      <section>
        <h2>A realistic first pilot</h2>
        <ol>
          <li>
            One willing repair shop or school repair club records ten diagnosed
            computer repairs.
          </li>
          <li>
            A coordinator shares each request with known local donors. People
            without a phone participate through the coordinator.
          </li>
          <li>
            A competent technician checks the actual part, its condition and
            suitability before reserving it.
          </li>
          <li>
            Donor and coordinator meet at an agreed staffed collection desk. The
            donor shares the handover code there.
          </li>
          <li>
            The technician records the test result. Successful repair also needs
            the device owner's confirmation.
          </li>
        </ol>
        <p>
          We would measure time to a usable offer, mismatched offers, handovers,
          completed repairs and unresolved repairs. No carbon savings or
          avoided-waste totals are inferred from offers.
        </p>
      </section>
      <section>
        <h2>What still needs local evidence</h2>
        <p>
          No neighborhood interviews or completed pilot repairs are claimed. The
          next research step is to ask a local repairer which repairs wait for
          parts, how long they wait, and whether donors hold useful matching
          parts. A real case and consented feedback should anchor the hackathon
          submission.
        </p>
      </section>
      <section>
        <h2>Scope and limits</h2>
        <p>
          The first version accepts memory, keyboard, cooling-fan and hinge
          requests for computers. It does not diagnose faults or certify
          electrical safety. Exact matching only compares transcribed labels.
          Even matching labels require technician inspection and testing.
          Batteries, power supplies, medical equipment and safety-critical
          repairs are outside this pilot.
        </p>
        <p>
          The demo contains fictional cases and fictional part references. Its
          totals belong only to your demo session. Bring real records into a
          separate empty workbench.
        </p>
      </section>
    </div>
  );
}
export function Privacy() {
  return (
    <div className="prose">
      <h1>Your workbench, your records.</h1>
      <section>
        <h2>Access</h2>
        <p>
          A workbench uses a private, randomly generated key. The browser
          remembers it on this device. Download the private access file to
          restore access elsewhere. Anyone holding that file has coordinator
          access. Keep it private; there is no email recovery or identity
          verification in this pilot.
        </p>
        <p>
          Each donor has a different private receipt key. A public request link
          does not expose donor receipts, other offers, inspection notes or
          coordinator access.
        </p>
      </section>
      <section>
        <h2>What becomes public</h2>
        <p>
          Anyone with a request link sees the workbench name, diagnosed request,
          required part labels, general collection area and request status. Use
          a staffed collection location. Do not put home addresses, phone
          numbers, student names, device serial numbers or private details in
          these fields.
        </p>
        <p>
          Donor aliases, label details and notes are visible to that donor and
          the coordinator. The coordinator records repair outcomes. The platform
          does not independently verify identity, ownership, part provenance or
          claimed test results.
        </p>
      </section>
      <section>
        <h2>Storage and retention</h2>
        <p>
          Records are stored in a Cloudflare D1 database. Demo workbenches
          expire after 7 days. Pilot workbenches expire after 30 days. Expired
          workbenches become inaccessible and are removed by daily cleanup.
          Cloudflare backup retention may extend beyond application deletion.
          Export your records before expiry.
        </p>
        <p>
          Access keys are remembered in browser local storage and sent over
          HTTPS in authorization headers. Server records store hashes of access
          keys. No analytics, advertising scripts or paid AI calls are used.
          Cloudflare processes request metadata for service operation. Rate
          limiting stores an hourly hash of the client IP and a request counter,
          removed by cleanup after expiry.
        </p>
      </section>
      <section>
        <h2>Control over an offer</h2>
        <p>
          A donor can withdraw a pending or reserved offer using their receipt.
          A coordinator can release a reservation, close an unfilled request or
          reopen an unresolved repair. Exported records stay wherever you save
          them. On a shared device, download your access file and use “Leave
          this device.”
        </p>
      </section>
    </div>
  );
}
