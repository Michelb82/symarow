<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306220229 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE architecture (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_74995EFA9F75D7B0 ON architecture (external_id)');
        $this->addSql('CREATE TABLE architecture_valuestream (architecture_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(architecture_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_CF49A4F873F96878 ON architecture_valuestream (architecture_id)');
        $this->addSql('CREATE INDEX IDX_CF49A4F8B374C073 ON architecture_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE architecture_process (architecture_id INT NOT NULL, process_id INT NOT NULL, PRIMARY KEY(architecture_id, process_id))');
        $this->addSql('CREATE INDEX IDX_D92F620773F96878 ON architecture_process (architecture_id)');
        $this->addSql('CREATE INDEX IDX_D92F62077EC2F574 ON architecture_process (process_id)');
        $this->addSql('CREATE TABLE capability (id SERIAL NOT NULL, parent_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, type VARCHAR(50) NOT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_96B1E2309F75D7B0 ON capability (external_id)');
        $this->addSql('CREATE INDEX IDX_96B1E230727ACA70 ON capability (parent_id)');
        $this->addSql('CREATE TABLE capability_valuestream (capability_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(capability_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_6801928492043242 ON capability_valuestream (capability_id)');
        $this->addSql('CREATE INDEX IDX_68019284B374C073 ON capability_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE capability_process (capability_id INT NOT NULL, process_id INT NOT NULL, PRIMARY KEY(capability_id, process_id))');
        $this->addSql('CREATE INDEX IDX_6C770FC892043242 ON capability_process (capability_id)');
        $this->addSql('CREATE INDEX IDX_6C770FC87EC2F574 ON capability_process (process_id)');
        $this->addSql('CREATE TABLE pipeline (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7DFCD9D99F75D7B0 ON pipeline (external_id)');
        $this->addSql('CREATE TABLE pipeline_valuestream (pipeline_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(pipeline_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_6551F483E80B93 ON pipeline_valuestream (pipeline_id)');
        $this->addSql('CREATE INDEX IDX_6551F483B374C073 ON pipeline_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE pipeline_process (pipeline_id INT NOT NULL, process_id INT NOT NULL, PRIMARY KEY(pipeline_id, process_id))');
        $this->addSql('CREATE INDEX IDX_B64E2F56E80B93 ON pipeline_process (pipeline_id)');
        $this->addSql('CREATE INDEX IDX_B64E2F567EC2F574 ON pipeline_process (process_id)');
        $this->addSql('CREATE TABLE process (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_861D18969F75D7B0 ON process (external_id)');
        $this->addSql('CREATE TABLE process_valuestream (process_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(process_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_8B0214BA7EC2F574 ON process_valuestream (process_id)');
        $this->addSql('CREATE INDEX IDX_8B0214BAB374C073 ON process_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE process_product (process_id INT NOT NULL, product_id INT NOT NULL, PRIMARY KEY(process_id, product_id))');
        $this->addSql('CREATE INDEX IDX_9B32DE787EC2F574 ON process_product (process_id)');
        $this->addSql('CREATE INDEX IDX_9B32DE784584665A ON process_product (product_id)');
        $this->addSql('CREATE TABLE product (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_D34A04AD9F75D7B0 ON product (external_id)');
        $this->addSql('CREATE TABLE product_valuestream (product_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(product_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_295849B44584665A ON product_valuestream (product_id)');
        $this->addSql('CREATE INDEX IDX_295849B4B374C073 ON product_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE team (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_C4E0A61F9F75D7B0 ON team (external_id)');
        $this->addSql('CREATE TABLE team_valuestream (team_id INT NOT NULL, valuestream_id INT NOT NULL, PRIMARY KEY(team_id, valuestream_id))');
        $this->addSql('CREATE INDEX IDX_6E4738E6296CD8AE ON team_valuestream (team_id)');
        $this->addSql('CREATE INDEX IDX_6E4738E6B374C073 ON team_valuestream (valuestream_id)');
        $this->addSql('CREATE TABLE team_process (team_id INT NOT NULL, process_id INT NOT NULL, PRIMARY KEY(team_id, process_id))');
        $this->addSql('CREATE INDEX IDX_796469A1296CD8AE ON team_process (team_id)');
        $this->addSql('CREATE INDEX IDX_796469A17EC2F574 ON team_process (process_id)');
        $this->addSql('CREATE TABLE team_capability (team_id INT NOT NULL, capability_id INT NOT NULL, PRIMARY KEY(team_id, capability_id))');
        $this->addSql('CREATE INDEX IDX_A86890F5296CD8AE ON team_capability (team_id)');
        $this->addSql('CREATE INDEX IDX_A86890F592043242 ON team_capability (capability_id)');
        $this->addSql('CREATE TABLE valuestream (id SERIAL NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) NOT NULL, external_id VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8577D7AB9F75D7B0 ON valuestream (external_id)');
        $this->addSql('ALTER TABLE architecture_valuestream ADD CONSTRAINT FK_CF49A4F873F96878 FOREIGN KEY (architecture_id) REFERENCES architecture (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE architecture_valuestream ADD CONSTRAINT FK_CF49A4F8B374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE architecture_process ADD CONSTRAINT FK_D92F620773F96878 FOREIGN KEY (architecture_id) REFERENCES architecture (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE architecture_process ADD CONSTRAINT FK_D92F62077EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE capability ADD CONSTRAINT FK_96B1E230727ACA70 FOREIGN KEY (parent_id) REFERENCES capability (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE capability_valuestream ADD CONSTRAINT FK_6801928492043242 FOREIGN KEY (capability_id) REFERENCES capability (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE capability_valuestream ADD CONSTRAINT FK_68019284B374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE capability_process ADD CONSTRAINT FK_6C770FC892043242 FOREIGN KEY (capability_id) REFERENCES capability (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE capability_process ADD CONSTRAINT FK_6C770FC87EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE pipeline_valuestream ADD CONSTRAINT FK_6551F483E80B93 FOREIGN KEY (pipeline_id) REFERENCES pipeline (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE pipeline_valuestream ADD CONSTRAINT FK_6551F483B374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE pipeline_process ADD CONSTRAINT FK_B64E2F56E80B93 FOREIGN KEY (pipeline_id) REFERENCES pipeline (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE pipeline_process ADD CONSTRAINT FK_B64E2F567EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE process_valuestream ADD CONSTRAINT FK_8B0214BA7EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE process_valuestream ADD CONSTRAINT FK_8B0214BAB374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE process_product ADD CONSTRAINT FK_9B32DE787EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE process_product ADD CONSTRAINT FK_9B32DE784584665A FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE product_valuestream ADD CONSTRAINT FK_295849B44584665A FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE product_valuestream ADD CONSTRAINT FK_295849B4B374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_valuestream ADD CONSTRAINT FK_6E4738E6296CD8AE FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_valuestream ADD CONSTRAINT FK_6E4738E6B374C073 FOREIGN KEY (valuestream_id) REFERENCES valuestream (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_process ADD CONSTRAINT FK_796469A1296CD8AE FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_process ADD CONSTRAINT FK_796469A17EC2F574 FOREIGN KEY (process_id) REFERENCES process (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_capability ADD CONSTRAINT FK_A86890F5296CD8AE FOREIGN KEY (team_id) REFERENCES team (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE team_capability ADD CONSTRAINT FK_A86890F592043242 FOREIGN KEY (capability_id) REFERENCES capability (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE architecture_valuestream DROP CONSTRAINT FK_CF49A4F873F96878');
        $this->addSql('ALTER TABLE architecture_valuestream DROP CONSTRAINT FK_CF49A4F8B374C073');
        $this->addSql('ALTER TABLE architecture_process DROP CONSTRAINT FK_D92F620773F96878');
        $this->addSql('ALTER TABLE architecture_process DROP CONSTRAINT FK_D92F62077EC2F574');
        $this->addSql('ALTER TABLE capability DROP CONSTRAINT FK_96B1E230727ACA70');
        $this->addSql('ALTER TABLE capability_valuestream DROP CONSTRAINT FK_6801928492043242');
        $this->addSql('ALTER TABLE capability_valuestream DROP CONSTRAINT FK_68019284B374C073');
        $this->addSql('ALTER TABLE capability_process DROP CONSTRAINT FK_6C770FC892043242');
        $this->addSql('ALTER TABLE capability_process DROP CONSTRAINT FK_6C770FC87EC2F574');
        $this->addSql('ALTER TABLE pipeline_valuestream DROP CONSTRAINT FK_6551F483E80B93');
        $this->addSql('ALTER TABLE pipeline_valuestream DROP CONSTRAINT FK_6551F483B374C073');
        $this->addSql('ALTER TABLE pipeline_process DROP CONSTRAINT FK_B64E2F56E80B93');
        $this->addSql('ALTER TABLE pipeline_process DROP CONSTRAINT FK_B64E2F567EC2F574');
        $this->addSql('ALTER TABLE process_valuestream DROP CONSTRAINT FK_8B0214BA7EC2F574');
        $this->addSql('ALTER TABLE process_valuestream DROP CONSTRAINT FK_8B0214BAB374C073');
        $this->addSql('ALTER TABLE process_product DROP CONSTRAINT FK_9B32DE787EC2F574');
        $this->addSql('ALTER TABLE process_product DROP CONSTRAINT FK_9B32DE784584665A');
        $this->addSql('ALTER TABLE product_valuestream DROP CONSTRAINT FK_295849B44584665A');
        $this->addSql('ALTER TABLE product_valuestream DROP CONSTRAINT FK_295849B4B374C073');
        $this->addSql('ALTER TABLE team_valuestream DROP CONSTRAINT FK_6E4738E6296CD8AE');
        $this->addSql('ALTER TABLE team_valuestream DROP CONSTRAINT FK_6E4738E6B374C073');
        $this->addSql('ALTER TABLE team_process DROP CONSTRAINT FK_796469A1296CD8AE');
        $this->addSql('ALTER TABLE team_process DROP CONSTRAINT FK_796469A17EC2F574');
        $this->addSql('ALTER TABLE team_capability DROP CONSTRAINT FK_A86890F5296CD8AE');
        $this->addSql('ALTER TABLE team_capability DROP CONSTRAINT FK_A86890F592043242');
        $this->addSql('DROP TABLE architecture');
        $this->addSql('DROP TABLE architecture_valuestream');
        $this->addSql('DROP TABLE architecture_process');
        $this->addSql('DROP TABLE capability');
        $this->addSql('DROP TABLE capability_valuestream');
        $this->addSql('DROP TABLE capability_process');
        $this->addSql('DROP TABLE pipeline');
        $this->addSql('DROP TABLE pipeline_valuestream');
        $this->addSql('DROP TABLE pipeline_process');
        $this->addSql('DROP TABLE process');
        $this->addSql('DROP TABLE process_valuestream');
        $this->addSql('DROP TABLE process_product');
        $this->addSql('DROP TABLE product');
        $this->addSql('DROP TABLE product_valuestream');
        $this->addSql('DROP TABLE team');
        $this->addSql('DROP TABLE team_valuestream');
        $this->addSql('DROP TABLE team_process');
        $this->addSql('DROP TABLE team_capability');
        $this->addSql('DROP TABLE valuestream');
    }
}
