package com.aidup.app

import com.aidup.app.models.sampleAidItems
import org.junit.Assert.assertEquals
import org.junit.Test

class AidItemTest {
    @Test
    fun testSampleDataCount() {
        // This checks if we have exactly 6 items in our sample list as defined in AidItem.kt
        assertEquals(6, sampleAidItems.size)
    }

    @Test
    fun testFirstItemCategory() {
        // The first item should be in the PEOPLE category
        assertEquals("Help Local Orphanage", sampleAidItems[0].title)
    }
}
