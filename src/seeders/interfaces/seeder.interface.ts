export interface ISeeder {
  /**
   * Seeds data for a specific entity
   * @returns Promise<void>
   */
  seed(): Promise<void>;

  /**
   * Checks if the seeder should run (e.g., if data already exists)
   * @returns Promise<boolean>
   */
  shouldRun(): Promise<boolean>;

  /**
   * Gets the name of the seeder for logging purposes
   * @returns string
   */
  getName(): string;
}