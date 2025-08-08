// examples/example-zone.js
import {
  ZoneRecordBuilder,
  ZoneConfigBuilder,
  ZoneRecordType,
  ZoneRecordName,
} from "../dist/index.js";

const exampleZone = new ZoneConfigBuilder()
  .setOrigin("example.com")
  .setTTL(3600)
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.SOA)
      .setValue(
        "ns1.example.com. hostmaster.example.com. 2025080801 7200 3600 1209600 3600"
      )
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.NS)
      .setValue("ns1.example.com.")
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.A)
      .setValue("192.0.2.1")
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.WWW)
      .setType(ZoneRecordType.CNAME)
      .setValue("@")
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.AT)
      .setType(ZoneRecordType.MX)
      .setValue("10 mail.example.com.")
      .build()
  )
  .addRecord(
    new ZoneRecordBuilder()
      .setName(ZoneRecordName.MAIL)
      .setType(ZoneRecordType.A)
      .setValue("192.0.2.2")
      .build()
  )
  .build();

export default exampleZone;