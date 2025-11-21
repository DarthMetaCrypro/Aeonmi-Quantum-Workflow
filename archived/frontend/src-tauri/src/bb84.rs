use rand::Rng;
use serde::{Deserialize, Serialize};

/// Quantum basis for BB84 protocol
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum Basis {
    Rectilinear, // |0⟩, |1⟩ (computational basis)
    Diagonal,    // |+⟩, |−⟩ (Hadamard basis)
}

/// Quantum bit state
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Qubit {
    pub bit: bool,
    pub basis: Basis,
}

/// BB84 Protocol Implementation
pub struct BB84Protocol {
    key_length: usize,
}

/// Result of key generation
#[derive(Debug, Serialize, Deserialize)]
pub struct KeyGenerationResult {
    pub alice_bits: Vec<bool>,
    pub alice_bases: Vec<String>,
    pub bob_bases: Vec<String>,
    pub raw_key: Vec<bool>,
    pub final_key: Vec<bool>,
    pub error_rate: f64,
    pub eavesdropping_detected: bool,
    pub key_hex: String,
}

impl BB84Protocol {
    pub fn new(key_length: usize) -> Self {
        BB84Protocol { key_length }
    }

    /// Alice: Generate random bits and bases
    pub fn alice_generate(&self) -> (Vec<bool>, Vec<Basis>) {
        let mut rng = rand::thread_rng();
        let bits: Vec<bool> = (0..self.key_length * 2).map(|_| rng.gen()).collect();
        let bases: Vec<Basis> = (0..self.key_length * 2)
            .map(|_| {
                if rng.gen() {
                    Basis::Diagonal
                } else {
                    Basis::Rectilinear
                }
            })
            .collect();
        (bits, bases)
    }

    /// Alice: Prepare qubits for transmission
    pub fn alice_prepare(&self, bits: &[bool], bases: &[Basis]) -> Vec<Qubit> {
        bits.iter()
            .zip(bases.iter())
            .map(|(&bit, &basis)| Qubit { bit, basis })
            .collect()
    }

    /// Bob: Choose random measurement bases
    pub fn bob_choose_bases(&self) -> Vec<Basis> {
        let mut rng = rand::thread_rng();
        (0..self.key_length * 2)
            .map(|_| {
                if rng.gen() {
                    Basis::Diagonal
                } else {
                    Basis::Rectilinear
                }
            })
            .collect()
    }

    /// Bob: Measure received qubits
    pub fn bob_measure(&self, qubits: &[Qubit], bob_bases: &[Basis]) -> Vec<bool> {
        let mut rng = rand::thread_rng();
        qubits
            .iter()
            .zip(bob_bases.iter())
            .map(|(qubit, &bob_basis)| {
                if qubit.basis == bob_basis {
                    // Matching basis - correct measurement
                    qubit.bit
                } else {
                    // Different basis - random result (50/50)
                    rng.gen()
                }
            })
            .collect()
    }

    /// Basis reconciliation: Keep only bits where bases match
    pub fn reconcile_bases(
        &self,
        alice_bits: &[bool],
        alice_bases: &[Basis],
        _bob_bits: &[bool],
        bob_bases: &[Basis],
    ) -> (Vec<bool>, Vec<usize>) {
        let mut sifted_key = Vec::new();
        let mut matching_indices = Vec::new();

        for (i, (a_basis, b_basis)) in alice_bases.iter().zip(bob_bases.iter()).enumerate() {
            if a_basis == b_basis {
                sifted_key.push(alice_bits[i]);
                matching_indices.push(i);
            }
        }

        (sifted_key, matching_indices)
    }

    /// Error detection: Compare subset of bits to detect eavesdropping
    pub fn detect_eavesdropping(
        &self,
        alice_key: &[bool],
        bob_key: &[bool],
        sample_size: usize,
    ) -> (f64, bool) {
        let mut rng = rand::thread_rng();
        let key_len = alice_key.len().min(bob_key.len());

        if key_len == 0 {
            return (0.0, false);
        }

        let actual_sample_size = sample_size.min(key_len / 2); // Use max 50% for error checking
        let mut errors = 0;

        // Random sampling for error rate calculation
        let mut sampled_indices: Vec<usize> = Vec::new();
        while sampled_indices.len() < actual_sample_size {
            let idx = rng.gen_range(0..key_len);
            if !sampled_indices.contains(&idx) {
                sampled_indices.push(idx);
                if alice_key[idx] != bob_key[idx] {
                    errors += 1;
                }
            }
        }

        let error_rate = errors as f64 / actual_sample_size as f64;
        let eavesdropping = error_rate > 0.11; // Threshold: 11% error rate

        (error_rate, eavesdropping)
    }

    /// Privacy amplification: Extract final secure key
    pub fn extract_final_key(&self, sifted_key: &[bool], target_length: usize) -> Vec<bool> {
        // Simple extraction - in production use proper hash functions
        let available = sifted_key.len().min(target_length);
        sifted_key[..available].to_vec()
    }

    /// Full BB84 protocol execution
    pub fn generate_key(&self) -> KeyGenerationResult {
        // Alice generates bits and bases
        let (alice_bits, alice_bases) = self.alice_generate();

        // Alice prepares qubits
        let qubits = self.alice_prepare(&alice_bits, &alice_bases);

        // Bob chooses measurement bases
        let bob_bases = self.bob_choose_bases();

        // Bob measures qubits
        let bob_bits = self.bob_measure(&qubits, &bob_bases);

        // Basis reconciliation
        let (sifted_key, _) = self.reconcile_bases(&alice_bits, &alice_bases, &bob_bits, &bob_bases);

        // Error detection
        let sample_size = (sifted_key.len() / 4).max(10); // Use 25% for error checking
        let (error_rate, eavesdropping) = self.detect_eavesdropping(&sifted_key, &sifted_key, sample_size);

        // Extract final key
        let final_key = self.extract_final_key(&sifted_key, self.key_length);

        // Convert to hex string
        let key_hex = bits_to_hex(&final_key);

        KeyGenerationResult {
            alice_bits: alice_bits.clone(),
            alice_bases: alice_bases.iter().map(basis_to_string).collect(),
            bob_bases: bob_bases.iter().map(basis_to_string).collect(),
            raw_key: sifted_key,
            final_key,
            error_rate,
            eavesdropping_detected: eavesdropping,
            key_hex,
        }
    }

    /// Generate quantum key with simulated eavesdropping for testing
    pub fn generate_key_with_eve(&self, eve_intercept_rate: f64) -> KeyGenerationResult {
        let mut rng = rand::thread_rng();

        // Alice generates bits and bases
        let (alice_bits, alice_bases) = self.alice_generate();

        // Alice prepares qubits
        let mut qubits = self.alice_prepare(&alice_bits, &alice_bases);

        // Eve intercepts and measures (introduces errors)
        if eve_intercept_rate > 0.0 {
            for qubit in &mut qubits {
                if rng.gen::<f64>() < eve_intercept_rate {
                    // Eve measures in random basis
                    let eve_basis = if rng.gen() {
                        Basis::Diagonal
                    } else {
                        Basis::Rectilinear
                    };

                    // If bases don't match, bit value becomes random
                    if eve_basis != qubit.basis {
                        qubit.bit = rng.gen();
                    }
                }
            }
        }

        // Bob chooses measurement bases
        let bob_bases = self.bob_choose_bases();

        // Bob measures qubits
        let bob_bits = self.bob_measure(&qubits, &bob_bases);

        // Basis reconciliation
        let (alice_sifted, matching_indices) =
            self.reconcile_bases(&alice_bits, &alice_bases, &bob_bits, &bob_bases);
        let bob_sifted: Vec<bool> = matching_indices.iter().map(|&i| bob_bits[i]).collect();

        // Error detection
        let sample_size = (alice_sifted.len() / 4).max(10);
        let (error_rate, eavesdropping) = self.detect_eavesdropping(&alice_sifted, &bob_sifted, sample_size);

        // Extract final key
        let final_key = self.extract_final_key(&alice_sifted, self.key_length);

        // Convert to hex string
        let key_hex = bits_to_hex(&final_key);

        KeyGenerationResult {
            alice_bits,
            alice_bases: alice_bases.iter().map(basis_to_string).collect(),
            bob_bases: bob_bases.iter().map(basis_to_string).collect(),
            raw_key: alice_sifted,
            final_key,
            error_rate,
            eavesdropping_detected: eavesdropping,
            key_hex,
        }
    }
}

/// Convert basis to string representation
fn basis_to_string(basis: &Basis) -> String {
    match basis {
        Basis::Rectilinear => "R".to_string(),
        Basis::Diagonal => "D".to_string(),
    }
}

/// Convert bit vector to hexadecimal string
fn bits_to_hex(bits: &[bool]) -> String {
    let mut hex = String::new();
    for chunk in bits.chunks(4) {
        let mut value = 0u8;
        for (i, &bit) in chunk.iter().enumerate() {
            if bit {
                value |= 1 << (3 - i);
            }
        }
        hex.push_str(&format!("{:X}", value));
    }
    hex
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bb84_basic() {
        let protocol = BB84Protocol::new(128);
        let result = protocol.generate_key();

        assert!(result.final_key.len() <= 128);
        assert!(result.error_rate < 0.5);
        assert!(!result.key_hex.is_empty());
    }

    #[test]
    fn test_bb84_with_eavesdropper() {
        let protocol = BB84Protocol::new(128);
        let result = protocol.generate_key_with_eve(0.5); // 50% interception

        // With 50% interception, should detect eavesdropping
        assert!(result.error_rate > 0.11 || result.eavesdropping_detected);
    }

    #[test]
    fn test_bits_to_hex() {
        let bits = vec![true, false, true, false, true, true, false, false];
        let hex = bits_to_hex(&bits);
        assert_eq!(hex, "AC"); // 1010 = A, 1100 = C
    }
}
